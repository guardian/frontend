

import closeCentralIcon from "svgs/icon/close-large.svg";
import theGuardianLogo from "svgs/logo/the-guardian-logo.svg";

const isUserLoggedIn = userLoggedIn => userLoggedIn ? 'site-message--subscription-banner__sign-in--already-signed-in' : '';

const subscriptionBannerTemplate = (subscriptionUrl: string, signInUrl: string, userLoggedIn: boolean): string => `
<div id="js-subscription-banner-site-message" class="site-message--subscription-banner site-message--gw-banner">
    <div class="site-message--subscription-banner__inner">
        <h3 class="site-message--subscription-banner__title">
           Read The Guardian in print
        </h3>

        <div class="site-message--subscription-banner__description">
            <p>Support The Guardian’s independent journalism by subscribing
             to <br class="temp-tablet-break">The Guardian Weekly, our essential world news magazine. Home delivery available wherever you are.</p>
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
            <div class="site-message--subscription-banner__cta-dismiss-container ${isUserLoggedIn(userLoggedIn)}">
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

        <div class="site-message--subscription-banner__sign-in ${isUserLoggedIn(userLoggedIn)}"
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
                <img srcset="https://i.guim.co.uk/img/media/f5c66a31a7d352acaee1c574e5cc009909f25119/0_0_2210_2062/500.png?quality=85&s=46fb180930f0ec0dc2f6b34a4e94cb06" alt="Guardian Weekly" />
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

const bannerTemplate = (subscriptionUrl: string, signInUrl: string, userLoggedIn: boolean): string => `<div class="site-message js-site-message js-double-site-message site-message--banner site-message--double-banner"
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