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
import marque36icon from 'svgs/icon/marque-36.svg';
// import {  getSync as geolocationGetSync } from 'lib/geolocation';
import {
    track as trackFirstPvConsent,
    // canShow as canShowFirstPvConsent,
    // messageCode as firstPvConsentMessageCode,
    makeHtml as makeFirstPvConsentHtml,
    hasUnsetAdChoices as firstPvHasUnsetAdChoices,
} from 'common/modules/ui/first-pv-consent-banner';
import {
    setAdConsentState,
    allAdConsents,
} from 'common/modules/commercial/ad-prefs.lib';

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

const closedAt = lastClosedAtKey =>
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

const subsciptionBannerTemplate = (): string => `
<div id="js-subscription-banner-site-message" class="site-message--subscription-banner">
    <div class="site-message--subscription-banner__inner">
        <h3 class="site-message--subscription-banner__title">
            A beautiful way to read it <br>
            A powerful way <br class="temp-mobile-break" /> to fund it
        </h3>


            <div class="site-message--subscription-banner__description">
                <p>Two innovative apps and ad-free reading on theguardian.com. The complete digital experience from The Guardian</p>
            </div>
            <div class="site-message--packshot-container">
                <img srcset="https://media.guim.co.uk/28370863b7bb19c5e8e0dc50fe871d4cca99778b/0_0_1894_1156/500.png" src="https://media.guim.co.uk/28370863b7bb19c5e8e0dc50fe871d4cca99778b/0_0_1894_1156/500.png" >
            </div>


        <div class="site-message--subscription-banner__cta-container">
            <a
                id="js-site-message--subscription-banner__cta"
                data-link-name="subscription-banner : to-sign-in"
                data-link-name="subscription-banner : success"
                class="site-message--subscription-banner__cta"
                href="${subscriptionUrl}"
            >
                Become a digital subscriber
            </a>
            <div class="site-message--subscription-banner__cta-dismiss-container">
                <a
                    id="js-site-message--subscription-banner__cta-dismiss"
                    class="site-message--subscription-banner__cta-dismiss"
                >
                    Not now
                </a>
            </div>
        </div>

        <div class="site-message--subscription-banner__sign-in">
            <p>Already a subscriber?</p>
            <br class="temp-mobile-break" />
            <a
                class="site-message--subscription-banner__subscriber-link"
                href="${signInUrl}"
            >
                Sign in to not see this again
            </a>
        </div>

        <div class="site-message--subscription-banner__gu-logo">
            ${marque36icon.markup}
        </div>
    </div>
</div>
`;

const consentSection = `<div id="js-first-pv-consent-site-message" class="site-message--first-pv-consent" tabindex="-1" data-link-name="release message" role="dialog" aria-label="welcome" aria-describedby="site-message__message">
        <div class="gs-container">
            <div class="site-message__inner js-site-message-inner">
                <div class="site-message__copy js-site-message-copy u-cf">
                    ${makeFirstPvConsentHtml()}
                </div>
            </div>
        </div>
    </div>`;

const bannerTemplate = (): string =>
    `<div class="site-message js-site-message js-double-site-message site-message--banner site-message--double-banner subscription-banner--holder"
          tabindex="-1"
          role="dialog"
          aria-label="welcome"
          aria-describedby="site-message__message"
          data-component="AcquisitionsEngagementBannerStylingTweaks_control"
          aria-live="polite"
        >

        ${subsciptionBannerTemplate()}
        ${firstPvHasUnsetAdChoices() ? consentSection : ''}
    </div>
    `;

const show: () => Promise<boolean> = () => {
    trackFirstPvConsent();
    trackSubscriptionBannerView();

    if (document.body) {
        document.body.insertAdjacentHTML('beforeend', bannerTemplate());
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
            subscriptionBannerSwitch
    );
    return can;
};

export const subsciptionMediumBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};
