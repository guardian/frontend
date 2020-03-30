// @flow

import closeCentralIcon from 'svgs/icon/close-large.svg';
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
<div id="js-subscription-banner-site-message" class="site-message--subscription-banner site-message--gw-banner">
    <div class="site-message--subscription-banner__inner">
        <h3 class="site-message--subscription-banner__title">
           Read The Guardian in Print
        </h3>

        <div class="site-message--subscription-banner__description">
            <p>Support The Guardian's independent journalism by subscribing
             to <br class="temp-tablet-break">The Guardian Weekly, our essential world news magazine</p>
        </div>

        <div class="site-message--subscription-banner__cta-container">
            <a
                id="js-site-message--subscription-banner__cta"
                class="site-message--subscription-banner__cta"
                data-link-name="subscription-banner : cta"
                href="${subscriptionUrl}"

            >
                <span class="cta-text-mobile">Subscribe now</span>
                <span class="cta-text-desktop">Become a Guardian Weekly subscriber</span>
            </a>
            <div class="site-message--subscription-banner__cta-dismiss-container ${isUserLoggedIn(
                userLoggedIn
            )}">
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
            <p>Already a subscriber?</p>
            <a
                id="js-site-message--subscription-banner__sign-in"
                class="site-message--subscription-banner__subscriber-link"
                data-link-name="subscription-banner : sign in"
                href="${signInUrl}"

            >
                <span class="site-message--subscription-banner__sign-in-link">Sign in</span> to not see this again
            </a>
        </div>

        <div class="site-message--packshot-container">

            <picture>
                <source srcset="https://i.guim.co.uk/img/media/e44355cacdb504278d20fe77e49579a73eb8e69b/13_7_1181_561/1181.png?width=350&dpr=2&quality=85&s=0cd8083e60e5d1737d67d4dafb25ae46" media="(max-width: 739px)">
                <source srcset="https://i.guim.co.uk/img/media/bd33dfb0e3bfc0c3df81e636713b6784db76ea82/551_203_1516_1145/1516.png?width=400&dpr=2&quality=85&s=1ed66a5275ccdce5c80ccbf3112106a1" media="(max-width: 1139px)">
                <source srcset="https://i.guim.co.uk/img/media/7552e031526eceae6385685876a4d52fbbf485e8/19_8_1814_1013/1814.png?width=541&dpr=2&quality=85&s=6f535ef203e58522ecc69bc86bc303ac" media="(min-width: 1140px)">
                <img srcset="https://i.guim.co.uk/img/media/7552e031526eceae6385685876a4d52fbbf485e8/19_8_1814_1013/1814.png?width=541&dpr=2&quality=85&s=6f535ef203e58522ecc69bc86bc303ac" alt="…">
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
