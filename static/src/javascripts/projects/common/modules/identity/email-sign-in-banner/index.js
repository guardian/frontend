// @flow

import { Message, hasUserAcknowledgedBanner } from 'common/modules/ui/message';
import config from 'lib/config';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { campaigns } from './campaigns';
import type { Campaign } from './campaigns';

const messageCode: string = 'email-sign-in-banner';

const signInLink = `${config.get('page.idUrl')}/login?returnUrl=${config.get(
    'page.host'
)}/email-newsletters`;

const getEmailCampaign = (): ?Campaign => {
    const emailCampaignInUrl = (new window.URLSearchParams(
        window.location.search
    ).getAll('utm_campaign') || [''])[0];
    return campaigns.find(
        (campaign: Campaign) => campaign.utm === emailCampaignInUrl
    );
};

const isSecondEmailPageview = (): boolean => getEmailCampaign() !== null;

const isInExperiment = (): boolean =>
    config.get('switches.idEmailSignInUpsell');

const canShow: () => Promise<boolean> = () =>
    Promise.resolve(
        !hasUserAcknowledgedBanner(messageCode) &&
            isInExperiment() &&
            isSecondEmailPageview()
    );

const show: () => void = () => {
    const campaign = getEmailCampaign();
    const message = new Message(messageCode, {
        cssModifierClass: messageCode,
        trackDisplay: true,
        siteMessageLinkName: messageCode,
        siteMessageComponentName: messageCode,
    });
    message.show(
        `Enjoying ${
            campaign.name
        }? <a href="${signInLink}">Sign in</a> to get more.`
    );
};

export const emailSignInBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};
