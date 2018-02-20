// @flow

import { getUserFromApi } from 'common/modules/identity/api';
import { Message } from 'common/modules/ui/message';
import { inlineSvg } from 'common/views/svgs';
import config from 'lib/config';

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
    title: `We’re changing how we communicate with readers. Let us know what emails you want to receive <strong>before 30 April</strong>, or <a data-link-name="gdpr-oi-campaign : alert : to-landing" href="${
        targets.landing
    }">find out more</a>.`,
    cta: `Opt in again`,
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
        if (!config.get('switches.idShowOptInEngagementBanner')) {
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
            new Message(messageCode, {
                important: true,
                cssModifierClass: 'gdpr-opt-in',
            }).show(templateHtml);
        }
    });
};

export { optInEngagementBannerInit };
