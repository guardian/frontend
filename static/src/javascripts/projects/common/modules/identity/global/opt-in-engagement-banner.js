// @flow

import { getUserFromApi } from 'common/modules/identity/api';
import { Message } from 'common/modules/ui/message';
import { inlineSvg } from 'common/views/svgs';
import config from 'lib/config';
import ophan from 'ophan/ng';
import userPrefs from 'common/modules/user-prefs';

const messageCode: string = 'gdpr-opt-in-jan-18';
const messageHidAtPref: string = `${messageCode}-hid-at`;
const messageCloseBtn = 'js-gdpr-oi-close';
const remindMeLaterInterval = 24 * 60 * 60 * 1000;
const medium: string = new URL(window.location.href).searchParams.get(
    'utm_medium'
);

type ApiUser = {
    statusFields: {
        hasRepermissioned: Boolean,
    },
};

type Template = {
    image: string,
    title: string,
    cta: string,
    remindMeLater: string,
};

const targets = {
    landing: 'https://gu.com/staywithus',
    journey: `${config.get('page.idUrl')}/consents/staywithus`,
};

const template: Template = {
    image: config.get('images.identity.opt-in'),
    title: `We’re changing how we communicate with you. Let us know <strong>before 30 April</strong> which emails you wish to continue receiving. <a data-link-name="gdpr-oi-campaign : alert : to-landing" href="${
        targets.landing
    }">Find out more</a> or click Continue.`,
    cta: `Continue`,
    remindMeLater: `Remind me later`,
};

const templateHtml: string = `
    <div id="site-message__message">
        <div class="site-message__message identity-gdpr-oi-alert">
            <div class="identity-gdpr-oi-alert__logo">
                <img src="${template.image}" alt="Stay with us" />
            </div>
            <div class="identity-gdpr-oi-alert__body">
                <div class="identity-gdpr-oi-alert__text">
                    ${template.title}
                </div>
                <div class="identity-gdpr-oi-alert__cta-space">
                    <a data-link-name="gdpr-oi-campaign : alert : remind-me-later" class="identity-gdpr-oi-alert__cta identity-gdpr-oi-alert__cta--sub ${
                        messageCloseBtn
                    }">
                        ${template.remindMeLater}
                    </a>
                    <a class="identity-gdpr-oi-alert__cta" target="_blank" href="${
                        targets.journey
                    }" data-link-name="gdpr-oi-campaign : alert : to-consents">
                        ${template.cta}
                        ${inlineSvg('arrowWhiteRight')}
                    </a>
                </div>
            </div>
        </div>
    </div>`;

const shouldDisplayBasedOnRemindMeLaterInterval = (): boolean => {
    const hidAt = userPrefs.get(messageHidAtPref);
    if (!hidAt) return true;
    return Date.now() > hidAt + remindMeLaterInterval;
};

const shouldDisplayBasedOnExperimentFlag = (): boolean =>
    config.get('tests.gdprOptinAlertVariant') === 'variant';

const shouldDisplayBasedOnMedium = (): boolean =>
    medium !== null && medium.toLowerCase() === 'email';

const shouldDisplayOptInBanner = (): Promise<boolean> =>
    new Promise(decision => {
        const shouldDisplay = [
            shouldDisplayBasedOnExperimentFlag(),
            shouldDisplayBasedOnRemindMeLaterInterval(),
            shouldDisplayBasedOnMedium(),
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
    shouldDisplayOptInBanner().then((shouldIt: boolean) => {
        if (shouldIt) {
            const msg = new Message(messageCode, {
                cssModifierClass: 'gdpr-opt-in',
                permanent: true,
                siteMessageComponentName: messageCode,
            });
            const shown = msg.show(templateHtml);
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
