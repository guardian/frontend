// @flow

import uniq from 'lodash/uniq';
import { hasUserAcknowledgedBanner } from 'common/modules/ui/message';
// import { trackNonClickInteraction } from 'common/modules/analytics/google';
import config from 'lib/config';
import userPrefs from 'common/modules/user-prefs';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { local } from 'lib/storage';
import {
    submitViewEvent,
    submitClickEvent,
} from 'common/modules/commercial/acquisitions-ophan';
import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';
import { pageShouldHideReaderRevenue } from 'common/modules/commercial/contributions-utilities';
import { track as trackFirstPvConsent } from 'common/modules/ui/first-pv-consent-banner';
import {
    setAdConsentState,
    allAdConsents,
} from 'common/modules/commercial/ad-prefs.lib';
import { bannerTemplate } from 'common/modules/ui/subscription-banner-template';

const messageCode = 'subscription-banner';
const pageviews = local.get('gu.alreadyVisited');
const subsciptionBannerClosedKey = 'subscriptionBannerLastClosedAt';
const subscriptionBannerSwitch = config.get('switches.subscriptionBanner');
const edition = config.get('page.edition');
const subscriptionUrl =
    'https://support.theguardian.com/subscribe/digital?INTCMP=gdnwb_copts_banner_subscribe_SubscriptionBanner&acquisitionData=%7B%22%3A%22GUARDIAN_WEB%22%2C%22campaignCode%22%3A%22subscriptions_banner%22%2C%22componentType%22%3A%22ACQUISITIONS_SUBSCRIPTIONS_BANNER%22%7D';
const signInUrl =
    'https://profile.theguardian.com/signin?utm_source=gdnwb&utm_medium=banner&utm_campaign=SubsBanner_Exisiting&CMP_TU=mrtn&CMP_BUNIT=subs';

const fiveOrMorePageViews = (currentPageViews: number) => currentPageViews >= 5;

const isAustralianEdition = (currentEdition: string) => currentEdition === 'AU';

const closedAt = (lastClosedAtKey: string) =>
    userPrefs.set(lastClosedAtKey, new Date().toISOString());

const bannerHasBeenAcknowledged = () => {
    const messageStates = userPrefs.get('messages') || [];
    messageStates.push(messageCode);
    userPrefs.set('messages', uniq(messageStates));
};

const subcriptionBannerCloseActions = () => {
    closedAt(subsciptionBannerClosedKey);
    bannerHasBeenAcknowledged();
};

const onAgree = (): void => {
    allAdConsents.forEach(_ => {
        setAdConsentState(_, true);
    });
};

const bindCloseHandler = (button, banner, callback) => {
    if (button) {
        button.addEventListener('click', () => {
            callback();
            banner.remove();
        });
    }
};

const bindClickHandler = (button, callback) => {
    if (button) {
        button.addEventListener('click', () => {
            callback();
        });
    }
};

const trackSubscriptionBannerView = () => {
    submitViewEvent({
        component: {
            componentType: 'ACQUISITIONS_OTHER',
            id: 'acquisitions-subscription-banner',
        },
    });
};

const trackSubscriptionBannerCtaClick = () => {
    submitClickEvent({
        component: {
            componentType: 'ACQUISITIONS_OTHER',
            id: 'acquisitions-subscription-banner',
        },
    });
};

const bindSubscriptionClickHandlers = () => {
    const subscriptionBannercloseButton = document.querySelector(
        '#js-site-message--subscription-banner__cta-dismiss'
    );
    const subscriptionBannerHtml = document.querySelector(
        '#js-subscription-banner-site-message'
    );

    const subscriptionBannerCta = document.querySelector(
        '#js-site-message--subscription-banner__cta'
    );

    if (subscriptionBannerHtml) {
        bindCloseHandler(
            subscriptionBannercloseButton,
            subscriptionBannerHtml,
            subcriptionBannerCloseActions
        );
        bindClickHandler(
            subscriptionBannerCta,
            trackSubscriptionBannerCtaClick
        );
    }
};

const bindConsentClickHandlers = () => {
    const consentBannerCloseButton = document.querySelector(
        '.site-message--first-pv-consent__button'
    );
    const consentBannerHtml = document.querySelector(
        '#js-first-pv-consent-site-message'
    );

    if (consentBannerHtml) {
        bindCloseHandler(consentBannerCloseButton, consentBannerHtml, onAgree);
    }
};

const show: () => Promise<boolean> = () => {
    trackFirstPvConsent();
    trackSubscriptionBannerView();

    if (document.body) {
        document.body.insertAdjacentHTML(
            'beforeend',
            bannerTemplate(subscriptionUrl, signInUrl)
        );
    }

    bindConsentClickHandlers();
    bindSubscriptionClickHandlers();

    return Promise.resolve(true);
};

const canShow: () => Promise<boolean> = () => {
    const can = Promise.resolve(
        fiveOrMorePageViews(pageviews) &&
            !hasUserAcknowledgedBanner(messageCode) &&
            !isAustralianEdition(edition) &&
            !shouldHideSupportMessaging() &&
            !pageShouldHideReaderRevenue() &&
            subscriptionBannerSwitch
    );
    return can;
};

export const firstPvConsentSubsciptionBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};
