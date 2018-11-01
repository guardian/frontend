// @flow
import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import arrowWhiteRight from 'svgs/icon/arrow-white-right.svg';
import config from 'lib/config';

export const acquisitionsBannerFivTemplate = (
    location: string,
    linkUrl: string,
): string =>
    `
    <div class="fiv-banner__close">
        <div class="fiv-banner__roundel">
            ${marque36icon.markup}
        </div>
        <button class="button fiv-banner__close-button js-site-message-close js-fiv-banner-close-button" data-link-name="hide release message">
            <span class="u-h">Close</span>
            ${closeCentralIcon.markup}
        </button>
    </div>
    <div class="fiv-banner__container">
        <div class="fiv-banner__text">
            WOOWOOWOO${location}
        </div>
        <div class="fiv-banner__cta">
            <button class="button fiv-banner__button" href="${
                linkUrl
            }">
                Caption${arrowWhiteRight.markup}
            </button>
            <img
                class="fiv-banner__payment-logos"
                src="${config.get(
                    'images.acquisitions.paypal-and-credit-card',
                    ''
                )}"
                alt="PayPal and credit card"
            >
        </div>
    </div>
    <a
        class="u-faux-block-link__overlay"
        target="_blank"
        href="${linkUrl}"
    ></a>
    `;
