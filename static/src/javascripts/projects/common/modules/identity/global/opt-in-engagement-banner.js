// @flow

import { getUserFromApi } from 'common/modules/identity/api';
import { Message } from 'common/modules/ui/message';
import { inlineSvg } from 'common/views/svgs';
import config from 'lib/config';
import ophan from 'ophan/ng';

const messageCode: string = 'gdpr-opt-in-jan-18';
const medium: string = new URL(window.location.href).searchParams.get(
    'utm_medium'
);

type ApiUser = {
    statusFields: {
        hasRepermissioned: Boolean,
    },
};

const targets = {
    landing: 'https://gu.com/staywithus',
    journey: `${config.get('page.idUrl')}/consents/staywithus`,
};

const template = {
    image: config.get('images.identity.opt-in'),
    title: `We’re changing how we communicate with readers. Let us know what emails you want to receive <strong>before 30 April</strong>, or&nbsp;<a data-link-name="gdpr-oi-campaign : alert : to-landing" href="${
        targets.landing
    }">find&nbsp;out&nbsp;more</a>.`,
    cta: `Opt in now`,
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
                <a class="identity-gdpr-oi-alert__cta" target="_blank" href="${
                    targets.journey
                }" data-link-name="gdpr-oi-campaign : alert : to-consents">
                    ${template.cta}
                    ${inlineSvg('arrowWhiteRight')}
                </a>
            </div>
        </div>
    </div>`;

const shouldDisplayOptInBanner = (): Promise<boolean> =>
    new Promise(decision => {
        if (config.get('gdprOptinAlertVariant') !== 'variant') {
            return decision(false);
        }
        if (medium === null || medium.toLowerCase() !== 'email')
            return decision(false);
        getUserFromApi((user: ApiUser) => {
            if (user === null || !user.statusFields.hasRepermissioned)
                decision(true);
            else decision(false);
        });
    });

const optInEngagementBannerInit = (): void => {
    shouldDisplayOptInBanner().then((shouldIt: boolean) => {
        if (shouldIt) {
            ophan.record({
                component: 'gdpr-oi-campaign-alert',
                action: 'gdpr-oi-campaign : alert : show',
            });
            new Message(messageCode, {
                cssModifierClass: 'gdpr-opt-in',
                siteMessageComponentName: messageCode
            }).show(templateHtml);
        }
    });
};

export { optInEngagementBannerInit };
