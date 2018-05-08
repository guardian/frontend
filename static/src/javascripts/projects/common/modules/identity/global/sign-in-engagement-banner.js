// @flow

import { Message } from 'common/modules/ui/message';
import { getCookie } from 'lib/cookies';
import { local } from 'lib/storage';
import config from 'lib/config';
import ophan from 'ophan/ng';
import userPrefs from 'common/modules/user-prefs';
import mediator from 'lib/mediator';
import { signInEngagementBannerDisplay } from 'common/modules/experiments/tests/sign-in-engagement-banner-display';
import { getVariant, isInVariant } from 'common/modules/experiments/utils';
import {trackNonClickInteraction} from "common/modules/analytics/interaction-tracking";

import iconComment from 'svgs/icon/comment-16.svg';
import iconEmail from 'svgs/icon/mail.svg';
import iconPhone from 'svgs/icon/device.svg';

import type {
    Template,
    LinkTargets,
    Feature,
} from './sign-in-engagement-banner/template';
import {
    makeTemplateHtml,
    bindableClassNames,
} from './sign-in-engagement-banner/template';

const messageCode: string = 'sign-in-30-april';
const signedInCookie: string = 'GU_U';

const forceDisplayHash = 'sign-in-eb-display=true';
const lastSeenAtKey = 'sign-in-eb.last-seen-at';
const lifeTimeViewsKey = 'sign-in-eb.lifetime-views';
const lifeTimeClosesKey = 'sign-in-eb.lifetime-closes';
const sessionStartedAtKey = 'sign-in-eb.session-started-at';
const sessionVisitsKey = 'sign-in-eb.session-visits';

const ERR_MALFORMED_HTML = 'ERR_MALFORMED_HTML';

const halfHourInMs = 30 * 60 * 1000;
const dayInMs = 24 * 60 * 60 * 1000;
const monthInMs = 30 * dayInMs;

const links: LinkTargets = {
    signIn: `${config.get(
        'page.idUrl'
    )}/signin?cmp=sign-in-eb&utm_campaign=sign-in-eb`,
    register: `${config.get(
        'page.idUrl'
    )}/register?cmp=sign-in-eb&utm_campaign=sign-in-eb`,
    why: 'https://www.theguardian.com/info/2018/may/08/why-sign-in-to-the-guardian',
};

/* A "session" here is defined as views separated < 30 minutes away from each other */
const recordSessionVisit = (): void => {
    if (Date.now() - (userPrefs.get(sessionStartedAtKey) || 0) > halfHourInMs) {
        userPrefs.set(sessionVisitsKey, 0);
    }
    const sessionVisits: number = userPrefs.get(sessionVisitsKey) || 0;
    userPrefs.set(sessionStartedAtKey, Date.now());
    userPrefs.set(sessionVisitsKey, sessionVisits + 1);
};

const features: Feature[] = [
    {
        icon: iconComment.markup,
        mainCopy: 'Join the conversation',
        subCopy: 'and comment on articles',
    },
    {
        icon: iconEmail.markup,
        mainCopy: 'Get closer to the journalism',
        subCopy: 'by subscribing to editorial&nbsp;emails',
    },
    {
        icon: iconPhone.markup,
        mainCopy: 'A consistent experience',
        subCopy: 'across all of your devices',
    },
];

const tpl: Template = {
    headerMain: ['Enjoy even', 'more', 'from', 'The&nbsp;Guardian'],
    headerSub: ['Please sign in or register to manage your preferences'],
    signInCta: 'Sign in',
    registerCta: 'Register',
    advantagesCta: 'Why sign in to The Guardian?',
    closeButton: 'Continue without signing in',
    features,
    links,
};

/* Is not paid content */
const isNotPaidContent = ():boolean =>
    (config.get(
        'page.isPaidContent'
    ) || false) === false

/* Must have visited 4 articles */
const hasReadOver4Articles = (): boolean =>
    (local.get('gu.alreadyVisited') || 0) >= 4;

/* Must be not already signed in */
const isNotSignedIn = (): boolean => getCookie(signedInCookie) === null;

/* Must be shown only 4 times total */
const hasSeenBannerLessThanFourTimesTotal = (): boolean =>
    (userPrefs.get(lifeTimeViewsKey) || 0) < 4;

/* Must be shown only once every 2 days */
const hasSeenBannerOnceInLastTwoDays = (): boolean =>
    Date.now() - (userPrefs.get(lastSeenAtKey) || Date.now() - monthInMs) >
    dayInMs * 2;

/* Must be shown on the second session pageview */
const isSecondSessionPageview = (): boolean =>
    (userPrefs.get(sessionVisitsKey) || 0) >= 2;

/* Must have first visited over 24 hours ago */
const isRecurringVisitor = (): boolean => {
    const ga: ?string = getCookie('_ga');
    if (!ga) return false;
    const date: number = parseInt(ga.split('.').pop(), 10) * 1000;
    if (!date || Number.isNaN(date)) return false;
    return Date.now() - date > dayInMs;
};

/* Test must be running & user must be in variant */
const isInTestVariant = (): boolean => {
    const variant = getVariant(signInEngagementBannerDisplay, 'variant');
    if (!variant) return false;
    return isInVariant(signInEngagementBannerDisplay, variant);
};

/* Make the alert show up iregardless */
const isForcedDisplay = (): boolean =>
    window.location.hash.includes(forceDisplayHash);

const bannerDoesNotCollide = (): Promise<boolean> =>
    new Promise(show => {
        setTimeout(() => {
            show(true);
        }, 1000);

        mediator.on('modules:onwards:breaking-news:ready', breakingShown => {
            if (!breakingShown) {
                show(true);
            } else {
                show(false);
            }
        });
        mediator.on('membership-message:display', () => {
            show(false);
        });
    });

const hide = (msg: Message) => {
    userPrefs.set(
        lifeTimeClosesKey,
        (userPrefs.get(lifeTimeClosesKey) || 0) + 1
    );
    msg.hide();
};

const canShow = (): Promise<boolean> => {
    const conditions = isForcedDisplay()
        ? [true]
        : [
              isNotSignedIn(),
              isNotPaidContent(),
              hasSeenBannerOnceInLastTwoDays(),
              isSecondSessionPageview(),
              hasSeenBannerLessThanFourTimesTotal(),
              isRecurringVisitor(),
              hasReadOver4Articles(),
              bannerDoesNotCollide(),
              isInTestVariant(),
          ];

    return Promise.all(conditions).then(solvedConditions =>
        solvedConditions.every(_ => _ === true)
    );
};

const show = (): void => {
    /* sorry for the side-effects */
    userPrefs.set(lastSeenAtKey, Date.now());
    userPrefs.set(lifeTimeViewsKey, (userPrefs.get(lifeTimeViewsKey) || 0) + 1);

    const msg = new Message(messageCode, {
        cssModifierClass: 'sign-in-message',
        trackDisplay: true,
        permanent: true,
        blocking: true,
        siteMessageComponentName: messageCode,
        customJs: () => {
            const closeButtonEl: ?HTMLElement = document.querySelector(
                `.${bindableClassNames.closeBtn}`
            );
            ophan.record({
                clickLinkNames: ['sign-in-eb : display']
            });
            trackNonClickInteraction('sign-in-eb : display');
            if (!closeButtonEl) {
                hide(msg);
                throw new Error(ERR_MALFORMED_HTML);
            }
            closeButtonEl.addEventListener('click', (ev: MouseEvent) => {
                ev.preventDefault();
                hide(msg);
            });
        },
    });
    msg.show(makeTemplateHtml(tpl));
};

const signInEngagementBannerInit = (): Promise<void> =>
    canShow().then((shouldDisplay: boolean) => {
        if (shouldDisplay) show();
    });

/* this needs to be a side effect */
recordSessionVisit();

export default {
    id: 'signInEngagementBanner',
    show,
    canShow,
};

export {
    signInEngagementBannerInit,
    canShow,
    show,
    sessionVisitsKey,
    lifeTimeViewsKey,
    sessionStartedAtKey,
    lastSeenAtKey,
    forceDisplayHash,
};
