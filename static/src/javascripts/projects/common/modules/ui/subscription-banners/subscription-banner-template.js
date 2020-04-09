// @flow

import closeCentralIcon from 'svgs/icon/close-central.svg';
import theGuardianLogo from 'svgs/logo/the-guardian-logo.svg';

const isUserLoggedIn = userLoggedIn =>
    userLoggedIn
        ? 'site-message--subscription-banner__sign-in--already-signed-in'
        : '';

const subscriptionBannerTemplate = (
    subscriptionUrl: string,
    signInUrl: string,
    userLoggedIn: boolean
): string => `
<div id="js-site-message--subscription-banner" class="site-message--subscription-banner">
    <div class="site-message--subscription-banner__inner">
        <h3 class="site-message--subscription-banner__title">
            <span class="site-message--subscription-banner__no-wrap">Open to all,</span>
            <span class="site-message--subscription-banner__no-wrap">supported by you</span>
        </h3>

        <div class="site-message--subscription-banner__description">
            <p>Support open and independent journalism and enjoy <b>the Daily</b>,
            the digital edition of your newspaper,
            <b>premium access to our Live app</b> and <b>ad-free</b> reading on theguardian.com</p>
        </div>

        <div class="site-message--subscription-banner__cta-container">
            <a
                id="js-site-message--subscription-banner__cta"
                class="site-message--subscription-banner__cta"
                data-link-name="subscription-banner : cta"
                href="${subscriptionUrl}"

            >
                <span class="site-message--subscription-banner__short-message">Subscribe now</span>
                <span class="site-message--subscription-banner__full-message">Become a digital subscriber</span>
            </a>
            <div class="site-message--subscription-banner__cta-dismiss-container">
                <a
                    id="js-site-message--subscription-banner__cta-dismiss"
                    class="site-message--subscription-banner__cta-dismiss"
                    data-link-name="subscription-banner : not now"
                    tabindex="0"
                >
                    Not now
                </a>
            </div>
        </div>

        <div class="site-message--subscription-banner__sign-in ${isUserLoggedIn(
            userLoggedIn
        )}"
        >
            Already a subscriber?
            <a
                id="js-site-message--subscription-banner__sign-in"
                class="site-message--subscription-banner__subscriber-link"
                data-link-name="subscription-banner : sign in"
                href="${signInUrl}"

            >
                <span class="site-message--subscription-banner__sign-in-link">Sign in</span></a>
            to not see this again
        </div>

        <div class="site-message--packshot-container">
            <picture>
                <source srcset="https://i.guim.co.uk/img/media/773ead1bd414781052c0983858e6859993870dd3/34_72_1825_1084/1825.png?width=500&dpr=2&quality=85&s=64835c94471dfdbd85f174ee85d901c8" media="(-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi)">
                <source srcset="https://i.guim.co.uk/img/media/773ead1bd414781052c0983858e6859993870dd3/34_72_1825_1084/1825.png?width=500&quality=85&s=24cb49b459c52c9d25868ca20979defb" >
                <img
                    srcset="https://i.guim.co.uk/img/media/773ead1bd414781052c0983858e6859993870dd3/34_72_1825_1084/1825.png?width=500&quality=85&s=24cb49b459c52c9d25868ca20979defb"
                    alt="the guardian mobile app, the guardian daily"
                />
            </picture>
        </div>

        <div
            id="js-site-message--subscription-banner__close-button"
            class="site-message--subscription-banner__close-button"
            data-link-name="subscription-banner : close"
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

const bannerTemplate = (
    subscriptionUrl: string,
    signInUrl: string,
    userLoggedIn: boolean
): string =>
    `<div class="site-message js-site-message js-double-site-message site-message--banner site-message--double-banner"
          id="js-site-message--subscription-banner__holder"
          tabindex="-1"
          role="dialog"
          aria-label="welcome"
          aria-describedby="site-message__message"
          aria-live="polite"
        >

        ${subscriptionBannerTemplate(subscriptionUrl, signInUrl, userLoggedIn)}
    </div>
    `;

export { bannerTemplate };
