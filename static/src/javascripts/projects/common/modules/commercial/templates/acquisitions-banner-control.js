// @flow
import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import arrowWhiteRight from 'svgs/icon/arrow-white-right.svg';
import config from 'lib/config';

export const acquisitionsBannerControlTemplate = (
    params: EngagementBannerTemplateParams
): string =>
    `
    <div class="engagement-banner__close">
        <div class="engagement-banner__roundel">
            ${marque36icon.markup}
        </div>
        <button class="button engagement-banner__close-button" data-link-name="hide release message">
            <span class="u-h">Close</span>
            ${closeCentralIcon.markup}
        </button>
    </div>
    <div class="engagement-banner__container">
        <div class="engagement-banner__text">
            ${params.messageText}${params.ctaText}
        </div>
        <div class="engagement-banner__cta">
            <button class="button engagement-banner__button" href="${
                params.linkUrl
            }">
                ${params.buttonCaption}${arrowWhiteRight.markup}
            </button>
            <img
                class="engagement-banner__payment-logos"
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
        href="${params.linkUrl}"
    ></a>
    `;
