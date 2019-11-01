// @flow

import marque36icon from 'svgs/icon/marque-36.svg';
import { makeHtml as makeFirstPvConsentHtml } from 'common/modules/ui/first-pv-consent-banner';

const subsciptionBannerTemplate = (
    subscriptionUrl: string,
    signInUrl: string
): string => `
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

const bannerTemplate = (
    subscriptionUrl: string,
    signInUrl: string,
    showConsent: boolean
): string =>
    `<div class="site-message js-site-message js-double-site-message site-message--banner site-message--double-banner subscription-banner--holder"
          tabindex="-1"
          role="dialog"
          aria-label="welcome"
          aria-describedby="site-message__message"
          data-component="AcquisitionsEngagementBannerStylingTweaks_control"
          aria-live="polite"
        >

        ${subsciptionBannerTemplate(subscriptionUrl, signInUrl)}
        ${showConsent ? consentSection : ''}
    </div>
    `;

export { bannerTemplate };
