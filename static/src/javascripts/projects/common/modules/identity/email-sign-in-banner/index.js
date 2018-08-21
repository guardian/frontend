// @flow

import { Message, hasUserAcknowledgedBanner } from 'common/modules/ui/message';
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import ophan from 'ophan/ng';
import config from 'lib/config';
import userPrefs from 'common/modules/user-prefs';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { make as makeTemplate, messageCode } from './template';
import { getEmailCampaignFromUrl, getEmailCampaignFromUtm } from './campaigns';

const displayEventKey: string = `${messageCode} : display`;
const userPrefsStoreKey = 'emailbanner.referrerEmail';

const emailPrefsLink = `https://${config.get('page.host')}/email-newsletters`;

const signInLink = `${config.get('page.idUrl')}/signin?returnUrl=${config.get(
    emailPrefsLink
)}`;

const isSecondEmailPageview = (): boolean => {
    const prefs = userPrefs.get(userPrefsStoreKey) || {};
    return prefs.pv && prefs.pv >= 2;
};

const isInExperiment = (): boolean =>
    config.get('switches.idEmailSignInUpsell', false);

const trackInteraction = (interaction: string): void => {
    ophan.record({
        component: 'first-pv-consent',
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
    return can;
};

const sideEffects: () => void = () => {
    const cmp = getEmailCampaignFromUrl();
    const existing = userPrefs.get(userPrefsStoreKey);
    if (cmp && !existing) {
        userPrefs.set(userPrefsStoreKey, {
            utm: cmp.utm,
            pv: 1,
        });
    } else if (existing && cmp && existing.utm !== cmp.utm) {
        userPrefs.remove(userPrefsStoreKey);
        userPrefs.set(userPrefsStoreKey, {
            utm: cmp.utm,
            pv: 1,
        });
    } else if (existing) {
        userPrefs.set(userPrefsStoreKey, {
            ...existing,
            pv: existing.pv + 1,
        });
    }
};

const show: () => Promise<boolean> = () => {
    trackInteraction(displayEventKey);
    const store = userPrefs.get(userPrefsStoreKey) || {};
    if (!store || !store.utm) {
        throw new Error(`email-sign-in : wrong store format`);
    }
    const campaign = getEmailCampaignFromUtm(store.utm);
    if (!campaign) {
        throw new Error(
            `email-sign-in missing campaign for utm (${store.utm})`
        );
    }
    userPrefs.remove(userPrefsStoreKey);
    const message = new Message(messageCode, {
        cssModifierClass: messageCode,
        trackDisplay: true,
        siteMessageLinkName: messageCode,
        siteMessageComponentName: messageCode,
    });

    return Promise.resolve(
        message.show(
            makeTemplate({
                campaign,
                signInLink,
                emailPrefsLink,
            })
        )
    );
};

sideEffects();

export const emailSignInBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};
