// @flow

import { getUserFromApi } from 'common/modules/identity/api';
import { Message } from 'common/modules/ui/message';
import { HAS_VISITED_CONSENTS_COOKIE_KEY } from 'common/modules/identity/consent-journey';
import { getCookie, addCookie } from 'lib/cookies';
import config from 'lib/config';
import mediator from 'lib/mediator';
import { local } from 'lib/storage';
import ophan from 'ophan/ng';
import userPrefs from 'common/modules/user-prefs';
import type { LinkTargets, Template } from './opt-in-eb-template';
import { makeTemplateHtml } from './opt-in-eb-template';

const messageCode: string = 'gdpr-opt-in-jan-18';
const messageHidAtPref: string = `${messageCode}-hid-at`;
const messageMoreShownAtPref: string = `${messageCode}-more-shown-at`;
const messageWasDismissedPref: string = `${messageCode}-hidden-once`;
const messageUserUsesNewslettersCookie: string = `gu-${
    messageCode
}-via-newsletter`
    .toUpperCase()
    .replace(/-/g, '_');
const messageCloseBtn = 'js-gdpr-oi-close';
const remindMeLaterInterval = 24 * 60 * 60 * 1000;
const lastShownAtInterval = 24 * 60 * 60 * 1000;

const ERR_EXPECTED_NO_BANNER = 'ERR_EXPECTED_NO_BANNER';

const shouldDisplayForMoreUsers = (): boolean =>
    config.get('switches.idShowOptInEngagementBannerMore');

type ApiUser = {
    statusFields: {
        hasRepermissioned: Boolean,
    },
};

const targets: LinkTargets = {
    landing:
        'https://gu.com/staywithus?CMP=gdpr-oi-campaign-alert&utm_campaign=gdpr-oi-campaign-alert',
    journey: `${config.get(
        'page.idUrl'
    )}/email-prefs?CMP=gdpr-oi-campaign-alert&utm_campaign=gdpr-oi-campaign-alert`,
};

const template: Template = {
    image: config.get('images.identity.opt-in-new-vertical'),
    title: `We’re changing how we communicate with you. Let us know <strong>before 30 April</strong> which emails you wish to continue receiving, otherwise you will stop hearing from us.`,
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

const shouldDisplayBasedOnLocalHasVisitedConsentsFlag = (): boolean =>
    getCookie(HAS_VISITED_CONSENTS_COOKIE_KEY) !== 'true';

const shouldDisplayBasedOnVisitedPageCount = (): boolean =>
    (local.get('gu.alreadyVisited') || 0) >= 5;

const shouldDisplayBasedOnExperimentFlag = (): boolean =>
    config.get('switches.idShowOptInEngagementBanner');

const shouldDisplayOnceADay = (): boolean => {
    const lastShownAt = userPrefs.get(messageMoreShownAtPref);
    if (!lastShownAt) return true;
    return Date.now() > lastShownAt + lastShownAtInterval;
};

const shouldDisplayIfNotAlreadyDismissed = (): boolean =>
    userPrefs.get(messageWasDismissedPref) !== 'true';

const shouldDisplayBasedOnMedium = (): boolean => userVisitedViaNewsletter();

const getDisplayConditions = (): boolean[] => {
    const basics = [
        shouldDisplayBasedOnExperimentFlag(),
        shouldDisplayBasedOnLocalHasVisitedConsentsFlag(),
    ];

    if (shouldDisplayForMoreUsers()) {
        return [
            ...basics,
            shouldDisplayOnceADay(),
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

const shouldDisplayOptInBanner = (): Promise<boolean> =>
    new Promise(decision => {
        const conditions = getDisplayConditions();

        if (conditions.some(_ => _ !== true)) {
            return decision(false);
        }

        getUserFromApi((user: ApiUser) => {
            if (user === null || !user.statusFields.hasRepermissioned)
                decision(true);
            else decision(false);
        });
    });

const hide = (msg: Message) => {
    msg.hide();
    userPrefs.set(messageHidAtPref, Date.now());
    if (shouldDisplayForMoreUsers()) {
        userPrefs.set(messageWasDismissedPref, 'true');
    } else {
        userPrefs.set(messageHidAtPref, Date.now());
    }
};

const waitForBannersOrTimeout = (): Promise<void> =>
    new Promise((show, reject) => {
        mediator.on('modules:onwards:breaking-news:ready', breakingShown => {
            if (!breakingShown) {
                show();
            } else {
                reject(new Error(ERR_EXPECTED_NO_BANNER));
            }
        });
        mediator.on('membership-message:display', () => {
            reject(new Error(ERR_EXPECTED_NO_BANNER));
        });
        setTimeout(() => {
            show();
        }, 1000);
    });

const optInEngagementBannerInit = (): void => {
    if (userVisitedViaNewsletter()) {
        addCookie(messageUserUsesNewslettersCookie, 'true');
    }

    shouldDisplayOptInBanner()
        .then((shouldIt: boolean) => {
            if (shouldIt) {
                return waitForBannersOrTimeout();
            }

            throw new Error(ERR_EXPECTED_NO_BANNER);
        })
        .then(() => {
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
                    if (!closeButtonEl)
                        throw new Error(
                            'gdpr-oi-campaign : Missing close button'
                        );
                    closeButtonEl.addEventListener(
                        'click',
                        (ev: MouseEvent) => {
                            ev.preventDefault();
                            hide(msg);
                        }
                    );
                },
            });
            const html = makeTemplateHtml(template, targets);
            msg.show(html);
        })
        .catch(err => {
            if (err.message !== ERR_EXPECTED_NO_BANNER) throw err;
        });
};

export { optInEngagementBannerInit };
