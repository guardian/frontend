// @flow

import { Message, hasUserAcknowledgedBanner } from 'common/modules/ui/message';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { campaigns } from './campaigns';
import { make as makeTemplate, classNames, messageCode } from './template';
import type { Campaign } from './campaigns';

const displayEventKey: string = `${messageCode} : display`;

const displayAfter = 4;

const emailPrefsLink = `https://${config.get(
    'page.host'
)}/email-newsletters`;

const signInLink = `${config.get('page.idUrl')}/login?returnUrl=${config.get(
    emailPrefsLink
)}`;

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
    config.get('switches.idEmailSignInUpsell', false);

const trackInteraction = (interaction: string): void => {
    ophan.record({
        component: 'first-pv-consent',
        action: interaction,
        value: interaction,
    });
    trackNonClickInteraction(interaction);
};

const canShow: () => Promise<boolean> = () =>
    Promise.resolve(
        !hasUserAcknowledgedBanner(messageCode) &&
            isInExperiment() &&
            isSecondEmailPageview()
    );

const show: () => void = () => {
    trackInteraction(displayEventKey);
    const campaign = getEmailCampaign();
    const message = new Message(messageCode, {
        cssModifierClass: messageCode,
        trackDisplay: true,
        siteMessageLinkName: messageCode,
        siteMessageComponentName: messageCode,
        customJs: () => {
            fastdom
                .read(() => ({
                    slide1El: document.querySelectorAll(
                        `.${classNames.slide1}`
                    ),
                    slide2El: document.querySelectorAll(
                        `.${classNames.slide2}`
                    ),
                    toSlideTwoEl: document.querySelectorAll(
                        `.${classNames.toSlideTwo}`
                    ),
                }))
                .then(({ slide1El, slide2El, toSlideTwoEl }) => {
                    toSlideTwoEl.forEach(toSlideTwoLinkEl => {
                        toSlideTwoLinkEl.addEventListener('click', ev => {
                            fastdom.write(() => {
                                slide1El.forEach(_ => {
                                    _.classList.add(classNames.slideHidden);
                                });
                                slide2El.forEach(_ => {
                                    _.classList.remove(classNames.slideHidden);
                                });
                            });
                        });
                    });
                });
        },
    });
    message.show(
        makeTemplate({
            campaign: campaign,
            signInLink,
            emailPrefsLink
        })
    );
};

export const emailSignInBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};
