// @flow

import { getUserFromApi } from 'common/modules/identity/api';
import { Message } from 'common/modules/ui/message';
import { HAS_VISITED_CONSENTS_COOKIE_KEY } from 'common/modules/identity/consent-journey';
import { getCookie, addCookie } from 'lib/cookies';
import config from 'lib/config';
import { local } from 'lib/storage';
import ophan from 'ophan/ng';
import mediator from 'lib/mediator';
import userPrefs from 'common/modules/user-prefs';
import { getVariant, isInVariant } from 'common/modules/experiments/utils';
import { signInEngagementBannerDisplay } from 'common/modules/experiments/tests/sign-in-engagement-banner-display';
import type { LinkTargets, Template } from './opt-in-eb-template';
import { makeTemplateHtml } from './opt-in-eb-template';

const messageCode: string = 'gdpr-opt-in-may-04';
const messageHidAtPref: string = `${messageCode}-hid-at`;
const messageMoreShownAtPref: string = `${messageCode}-more-shown-at`;
const messageWasDismissedPref: string = `${messageCode}-was-dismissed`;
const messageUserUsesNewslettersCookie: string = `gu-${
    messageCode
}-via-newsletter`
    .toUpperCase()
    .replace(/-/g, '_');
const messageCloseBtn = 'js-gdpr-oi-close';
const remindMeLaterInterval = 24 * 60 * 60 * 1000;

const shouldDisplayForMoreUsers = (): boolean =>
    config.get('switches.idShowOptInEngagementBannerMore');

type ApiUser = {
    statusFields: {
        hasRepermissioned: Boolean,
    },
};

const targets: LinkTargets = {
    landing:
        'https://www.theguardian.com/info/ng-interactive/2018/feb/21/stay-with-us?CMP=gdpr-oi-campaign-alert&utm_campaign=gdpr-oi-campaign-alert',
};

const template: Template = {
    image: config.get('images.identity.missing'),
    title: `We’re changing how we communicate with you. Let us know which emails you wish to continue receiving, otherwise you will stop hearing from us.`,
    cta: `Continue`,
    remindMeLater: shouldDisplayForMoreUsers()
        ? `No, thanks`
        : `Remind me later`,
    messageCloseBtn,
};

const userVisitedViaNewsletter = (): boolean =>
    ['utm_source=eml', 'utm_medium=email']
        .map(_ => window.location.href.toLowerCase().includes(_))
        .some(_ => _ === true);

const shouldDisplayBasedOnRemindMeLaterInterval = (): boolean => {
    const hidAt = userPrefs.get(messageHidAtPref);
    if (!hidAt) return true;
    return Date.now() > hidAt + remindMeLaterInterval;
};

const bannerDoesNotCollide = (): Promise<boolean> =>
    new Promise(resolve => {
        mediator.on('modules:onwards:breaking-news:ready', breakingShown => {
            if (breakingShown) {
                resolve(false);
            }
        });
        mediator.on('membership-message:display', () => {
            resolve(false);
        });
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });

const shouldDisplayBasedOnLocalHasVisitedConsentsFlag = (): boolean =>
    getCookie(HAS_VISITED_CONSENTS_COOKIE_KEY) !== 'true';

const shouldDisplayBasedOnVisitedPageCount = (): boolean =>
    (local.get('gu.alreadyVisited') || 0) >= 5;

const shouldDisplayBasedOnExperimentFlag = (): boolean =>
    config.get('switches.idShowOptInEngagementBanner');

const shouldDisplayIfNotAlreadyDismissed = (): boolean =>
    userPrefs.get(messageWasDismissedPref) !== 'true';

const shouldDisplayBasedOnMedium = (): boolean => userVisitedViaNewsletter();

/* User must not be in variant */
const shouldDisplayifNotInSignInTestVariant = (): boolean => {
    const variant = getVariant(signInEngagementBannerDisplay, 'variant');
    if (!variant) return true;
    return !isInVariant(signInEngagementBannerDisplay, variant);
};

const getDisplayConditions = (): boolean[] => {
    const basics = [
        shouldDisplayBasedOnExperimentFlag(),
        shouldDisplayifNotInSignInTestVariant(),
        shouldDisplayBasedOnLocalHasVisitedConsentsFlag(),
    ];

    if (shouldDisplayForMoreUsers()) {
        return [
            ...basics,
            shouldDisplayBasedOnVisitedPageCount(),
            shouldDisplayIfNotAlreadyDismissed(),
        ];
    }

    return [
        ...basics,
        shouldDisplayBasedOnRemindMeLaterInterval(),
        shouldDisplayBasedOnMedium(),
    ];
};

const dismiss = () => {
    if (shouldDisplayForMoreUsers()) {
        userPrefs.set(messageWasDismissedPref, 'true');
    } else {
        userPrefs.set(messageHidAtPref, Date.now());
    }
};

const hide = (msg: Message) => {
    msg.hide();
    dismiss();
};

const canShow = (): Promise<boolean> => {
    if (userVisitedViaNewsletter()) {
        addCookie(messageUserUsesNewslettersCookie, 'true');
    }

    const checkUser = () =>
        new Promise(decision => {
            getUserFromApi((user: ApiUser) => {
                if (user === null || !user.statusFields.hasRepermissioned)
                    decision(true);
                else decision(false);
            });
        });

    const conditions = getDisplayConditions();

    if (conditions.some(_ => _ !== true)) {
        return Promise.resolve(false);
    }

    return Promise.all([checkUser(), bannerDoesNotCollide()]).then(
        asyncConditions => asyncConditions.every(_ => _ === true)
    );
};

const show = (): void => {
    const msg = new Message(messageCode, {
        cssModifierClass: 'gdpr-opt-in',
        trackDisplay: true,
        permanent: true,
        siteMessageComponentName: messageCode,
        customJs: () => {
            if (shouldDisplayForMoreUsers()) {
                userPrefs.set(messageMoreShownAtPref, Date.now());
            }
            ophan.record({
                component: 'gdpr-oi-campaign-alert',
                action: 'gdpr-oi-campaign : alert : show',
                value: 'gdpr-oi-campaign : alert : show',
            });
            const closeButtonEl: ?HTMLElement = document.querySelector(
                `.${messageCloseBtn}`
            );
            const dismissableEls: HTMLElement[] = [
                ...document.querySelectorAll(`.identity-gdpr-oi-alert__body a`),
            ];
            if (!closeButtonEl)
                throw new Error('gdpr-oi-campaign : Missing close button');
            closeButtonEl.addEventListener('click', (ev: MouseEvent) => {
                ev.preventDefault();
                hide(msg);
            });
            dismissableEls.forEach(_ => {
                _.addEventListener('click', () => {
                    dismiss();
                });
            });
        },
    });
    const html = makeTemplateHtml(template, targets);
    msg.show(html);
};

const optInEngagementBannerInit = (): Promise<void> =>
    canShow().then((shouldDisplay: boolean) => {
        if (shouldDisplay) {
            show();
        }
    });

export { optInEngagementBannerInit };

export default {
    id: 'optInEngagementBanner',
    show,
    canShow,
};
