// @flow

import { Message, hasUserAcknowledgedBanner } from 'common/modules/ui/message';
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import ophan from 'ophan/ng';
import config from 'lib/config';
import userPrefs from 'common/modules/user-prefs';
import fastdom from 'lib/fastdom-promise';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { campaigns } from './campaigns';
import { make as makeTemplate, classNames, messageCode } from './template';
import type { Campaign } from './campaigns';

const displayEventKey: string = `${messageCode} : display`;
const userPrefsReferrerKey = 'emailbanner.referrerEmail';

const emailPrefsLink = `https://${config.get('page.host')}/email-newsletters`;

const signInLink = `${config.get('page.idUrl')}/login?returnUrl=${config.get(
    emailPrefsLink
)}`;

const getEmailCampaignFromUtm = (utm): ?Campaign =>
    campaigns.find((campaign: Campaign) => campaign.utm === utm);

const getEmailCampaignFromUrl = (): ?Campaign => {
    const emailCampaignInUrl = (new window.URLSearchParams(
        window.location.search
    ).getAll('utm_campaign') || [''])[0];
    return getEmailCampaignFromUtm(emailCampaignInUrl);
};

const isSecondEmailPageview = (): boolean =>
    userPrefs.get(userPrefsReferrerKey) !== null;

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

const canShow: () => Promise<boolean> = () => {
    const can = Promise.resolve(
        !hasUserAcknowledgedBanner(messageCode) &&
            isInExperiment() &&
            isSecondEmailPageview()
    );
    const cmp = getEmailCampaignFromUrl();
    if (cmp) {
        userPrefs.set(userPrefsReferrerKey, cmp.utm);
    }
    return can;
};

const show: () => void = () => {
    trackInteraction(displayEventKey);
    const utm = userPrefs.get(userPrefsReferrerKey);
    const campaign = getEmailCampaignFromUtm(utm);
    if (!campaign) {
        throw new Error(`missing campaign for utm (${utm})`);
    }
    // userPrefs.remove(userPrefsReferrerKey)
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
                        toSlideTwoLinkEl.addEventListener('click', () => {
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
            campaign,
            signInLink,
            emailPrefsLink,
        })
    );
};

export const emailSignInBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};
