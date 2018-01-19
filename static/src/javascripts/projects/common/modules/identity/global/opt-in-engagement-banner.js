// @flow

import { getUserFromApi } from 'common/modules/identity/api';
import { Message } from 'common/modules/ui/message';
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

const template = {
    title: 'You have to update your email settings',
    cta: `Update them now »`,
    link: `${config.page.idUrl}/consents`,
};

const templateHtml: string = `
    <div id="site-message__message">
        <div class="site-message__message site-message__message--gdpr-opt-in">
            <div class="gdpr-opt-in__message-text">
                ${template.title}
            </div>
            <a target="_blank" href="${
                template.link
            }" data-link-name="gdrp-opt-in : banner-click">
                ${template.cta}
            </a>
        </div>
    </div>`;

const shouldDisplayOptInBanner = (): Promise<boolean> =>
    new Promise(decision => {
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
            }).show(templateHtml);
        }
    });
};

export { optInEngagementBannerInit };
