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
import { trackNonClickInteraction } from 'common/modules/analytics/google';

import { mainHtml, feedbackHtml } from './sign-in-engagement-banner/content';

const messageCode: string = 'sign-in-30-april';
const signedInCookie: string = 'GU_U';

const forceDisplayHash: string = 'sign-in-eb-display=';
const forceDisplayFeedbackHash: string = `${forceDisplayHash}feedback`;
const forceDisplaySegueHash: string = `${forceDisplayHash}segue`;
const lastSeenAtKey: string = 'sign-in-eb.last-seen-at';
const lifeTimeViewsKey: string = 'sign-in-eb.lifetime-views';
const lifeTimeClosesKey: string = 'sign-in-eb.lifetime-closes';
const sessionStartedAtKey: string = 'sign-in-eb.session-started-at';
const sessionVisitsKey: string = 'sign-in-eb.session-visits';

const ERR_MALFORMED_HTML: string = 'ERR_MALFORMED_HTML';

const ALERT_FEEDBACK: string = 'alert_feedback';
const ALERT_MAIN: string = 'alert_main';

const halfHourInMs: number = 30 * 60 * 1000;
const dayInMs: number = 24 * 60 * 60 * 1000;
const monthInMs: number = 30 * dayInMs;

const maxLifetimeViews = 4;

const bindableClassNames = {
    closeBtn: 'js-site-message--sign-in__dismiss',
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

/* What initial alert to show */
const getInitialAlertType = (): string =>
    window.location.hash.includes(forceDisplayFeedbackHash)
        ? ALERT_FEEDBACK
        : ALERT_MAIN;

/* Should show feedback after? */
const showFeedbackSegue = (): boolean =>
    (userPrefs.get(lifeTimeViewsKey) || 0) >= maxLifetimeViews ||
    window.location.hash.includes(forceDisplaySegueHash);

/* Is not paid content */
const isNotPaidContent = (): boolean =>
    (config.get('page.isPaidContent') || false) === false;

/* Must have visited 4 articles */
const hasReadOver4Articles = (): boolean =>
    (local.get('gu.alreadyVisited') || 0) >= 4;

/* Must be not already signed in */
const isNotSignedIn = (): boolean => getCookie(signedInCookie) === null;

/* Must be shown only 4 times total */
const hasSeenBannerLessThanFourTimesTotal = (): boolean =>
    (userPrefs.get(lifeTimeViewsKey) || 0) <= maxLifetimeViews;

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

const hide = (msg: Message): void => {
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

type AlertParams = {
    displayEvent: string,
    html: string,
    onClose: () => void,
};

const showAlert = (params: AlertParams) => {
    const msg = new Message(messageCode, {
        cssModifierClass: 'sign-in-message',
        trackDisplay: true,
        permanent: true,
        blocking: true,
        siteMessageComponentName: messageCode,
        customJs: () => {
            const closeButtonEls: HTMLElement[] = [
                ...document.querySelectorAll(`.${bindableClassNames.closeBtn}`),
            ];
            ophan.record({
                component: 'sign-in-eb',
                action: params.displayEvent,
                value: params.displayEvent,
            });
            trackNonClickInteraction(params.displayEvent);
            if (closeButtonEls.length < 1) {
                hide(msg);
                throw new Error(ERR_MALFORMED_HTML);
            }
            closeButtonEls.forEach(closeButtonEl => {
                closeButtonEl.addEventListener('click', (ev: MouseEvent) => {
                    ev.preventDefault();
                    hide(msg);
                    if (params.onClose) {
                        requestAnimationFrame(() => {
                            params.onClose();
                        });
                    }
                });
            });
        },
    });
    msg.show(params.html);
};

const show = (): void => {
    userPrefs.set(lastSeenAtKey, Date.now());
    userPrefs.set(lifeTimeViewsKey, (userPrefs.get(lifeTimeViewsKey) || 0) + 1);

    const html = getInitialAlertType() === ALERT_MAIN ? mainHtml : feedbackHtml;

    showAlert({
        displayEvent: 'sign-in-eb : display',
        html,
        onClose: () => {
            if (showFeedbackSegue()) {
                showAlert({
                    displayEvent: 'sign-in-eb : display-feedback',
                    html: feedbackHtml,
                });
            }
        },
    });
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
    bindableClassNames,
    showFeedbackSegue,
};
