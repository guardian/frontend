// @flow

import closeCentralIcon from 'svgs/icon/close-central.svg';
import theGuardianLogo from 'svgs/logo/the-guardian-logo.svg';

import { makeHtml as makeFirstPvConsentHtml } from 'common/modules/ui/first-pv-consent-banner';

//

const isUserLoggedIn = userLoggedIn =>
    userLoggedIn
        ? 'site-message--subscription-banner__sign-in--already-signed-in'
        : '';

const subscriptionBannerTemplate = (
    subscriptionUrl: string,
    signInUrl: string,
    userLoggedIn: boolean,
    abTestVariant: boolean
): string => `
<div id="js-subscription-banner-site-message" class="site-message--subscription-banner">
    <div class="site-message--subscription-banner__inner">
        <h3 class="site-message--subscription-banner__title">
            ${
                abTestVariant
                    ? `<span class="variantB-header">We're going to need <br /> each other this year</span>`
                    : `A beautiful way to read it <br /> A powerful way to fund it`
            }
        </h3>

        <div class="site-message--subscription-banner__description">
            <p>Support The Guardian and enjoy The Guardian Daily,
            Premium access to The Guardian Live app and ad-free
            reading on theguardian.com</p>
        </div>

        <div class="site-message--subscription-banner__cta-container">
            <a
                id="js-site-message--subscription-banner__cta"
                class="site-message--subscription-banner__cta"
                href="${subscriptionUrl}"
            >
                Become a digital subscriber
            </a>
            <div class="site-message--subscription-banner__cta-dismiss-container ${isUserLoggedIn(
                userLoggedIn
            )}">
                <a
                    id="js-site-message--subscription-banner__cta-dismiss"
                    class="site-message--subscription-banner__cta-dismiss"
                    tabindex="0"
                >
                    Not now
                </a>
            </div>
        </div>

        <div class="site-message--subscription-banner__sign-in ${isUserLoggedIn(
            userLoggedIn
        )}">
            <p>Already a subscriber?</p>
            <br class="temp-mobile-break" />
            <a
                class="site-message--subscription-banner__subscriber-link"
                href="${signInUrl}"
            >
                <span class="site-message--subscription-banner__sign-in-link">Sign in</span> to not see this again
            </a>
        </div>

        <div class="site-message--packshot-container">
            <img
                srcset="https://media.guim.co.uk/28370863b7bb19c5e8e0dc50fe871d4cca99778b/0_0_1894_1156/500.png"
                src="https://media.guim.co.uk/28370863b7bb19c5e8e0dc50fe871d4cca99778b/0_0_1894_1156/500.png"
                alt="the guardian mobile app, the guardian daily"
            >
        </div>

        <div id="js-site-message--subscription-banner__close-button"
            class="site-message--subscription-banner__close-button"
            aria-label="Close"
            tabindex="0"
        >
            ${closeCentralIcon.markup}
        </div>

        <div class="site-message--subscription-banner__gu-logo">
            ${theGuardianLogo.markup}
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
    showConsent: boolean,
    userLoggedIn: boolean,
    abTestVariant: any
): string =>
    `<div class="site-message js-site-message js-double-site-message site-message--banner site-message--double-banner subscription-banner--holder"
          tabindex="-1"
          role="dialog"
          aria-label="welcome"
          aria-describedby="site-message__message"
          data-component="AcquisitionsEngagementBannerStylingTweaks_control"
          aria-live="polite"
        >

        ${subscriptionBannerTemplate(
            subscriptionUrl,
            signInUrl,
            userLoggedIn,
            abTestVariant
        )}
        ${showConsent ? consentSection : ''}
    </div>
    `;

export { bannerTemplate };
