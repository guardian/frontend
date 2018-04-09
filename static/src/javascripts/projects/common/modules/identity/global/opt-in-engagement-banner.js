// @flow

import { getUserFromApi } from 'common/modules/identity/api';
import { Message } from 'common/modules/ui/message';
import { HAS_VISITED_CONSENTS_COOKIE_KEY } from 'common/modules/identity/consent-journey';
import { getCookie, addCookie } from 'lib/cookies';
import config from 'lib/config';
import ophan from 'ophan/ng';
import userPrefs from 'common/modules/user-prefs';
import type { LinkTargets, Template } from './opt-in-eb-template';
import { makeTemplateHtml } from './opt-in-eb-template';

const messageCode: string = 'gdpr-opt-in-jan-18';
const messageHidAtPref: string = `${messageCode}-hid-at`;
const messageUserUsesNewslettersCookie: string = `gu-${
    messageCode
}-via-newsletter`.toUpperCase();
const messageCloseBtn = 'js-gdpr-oi-close';
const remindMeLaterInterval = 24 * 60 * 60 * 1000;

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
    )}/consents/staywithus?CMP=gdpr-oi-campaign-alert&utm_campaign=gdpr-oi-campaign-alert`,
};

const template: Template = {
    image: config.get('images.identity.opt-in'),
    title: `We’re changing how we communicate with you. Let us know <strong>before 30 April</strong> which emails you wish to continue receiving. <a data-link-name="gdpr-oi-campaign : alert : to-landing" href="${
        targets.landing
    }">Find out more</a> or click Continue.`,
    cta: `Continue`,
    remindMeLater: `Remind me later`,
    messageCloseBtn,
};

const userVisitedViaNewsletter = (): boolean =>
    ['utm_source=eml', 'utm_medium=email']
        .map(_ => window.location.href.toLowerCase().contains(_))
        .some(_ => _ === true);

const shouldDisplayBasedOnRemindMeLaterInterval = (): boolean => {
    const hidAt = userPrefs.get(messageHidAtPref);
    if (!hidAt) return true;
    return Date.now() > hidAt + remindMeLaterInterval;
};

const shouldDisplayBasedOnLocalHasVisitedConsentsFlag = (): boolean =>
    getCookie(HAS_VISITED_CONSENTS_COOKIE_KEY) !== 'true';

const shouldDisplayBasedOnExperimentFlag = (): boolean =>
    config.get('tests.gdprOptinAlertVariant') === 'variant';

const shouldDisplayBasedOnMedium = (): boolean => userVisitedViaNewsletter();

const shouldDisplayOptInBanner = (): Promise<boolean> =>
    new Promise(decision => {
        const shouldDisplay = [
            shouldDisplayBasedOnExperimentFlag(),
            shouldDisplayBasedOnRemindMeLaterInterval(),
            shouldDisplayBasedOnMedium(),
            shouldDisplayBasedOnLocalHasVisitedConsentsFlag(),
        ];

        if (!shouldDisplay.every(_ => _ === true)) {
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
};

const optInEngagementBannerInit = (): void => {
    if (userVisitedViaNewsletter()) {
        addCookie(messageUserUsesNewslettersCookie, 'true');
    }

    shouldDisplayOptInBanner().then((shouldIt: boolean) => {
        if (shouldIt) {
            const msg = new Message(messageCode, {
                cssModifierClass: 'gdpr-opt-in',
                permanent: true,
                siteMessageComponentName: messageCode,
            });
            const html = makeTemplateHtml(template, targets);
            const shown = msg.show(html);
            if (shown) {
                ophan.record({
                    component: 'gdpr-oi-campaign-alert',
                    action: 'gdpr-oi-campaign : alert : show',
                });
                const closeButtonEl: ?HTMLElement = document.querySelector(
                    `.${messageCloseBtn}`
                );
                if (!closeButtonEl)
                    throw new Error('gdpr-oi-campaign : Missing close button');
                closeButtonEl.addEventListener('click', (ev: MouseEvent) => {
                    ev.preventDefault();
                    hide(msg);
                });
            }
        }
    });
};

export { optInEngagementBannerInit };
