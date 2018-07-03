// @flow
import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import arrowWhiteRight from 'svgs/icon/arrow-white-right.svg';
import config from 'lib/config';

export const acquisitionsBannerControlTemplate = (
    params: EngagementBannerTemplateParams
) =>
    `
    <div class="support-the-guardian-banner__close">
        <div class="support-the-guardian-banner__roundel">
            ${marque36icon.markup}
        </div>
        <button class="button support-the-guardian-banner__close-button js-site-message-close" data-link-name="hide release message">
            <span class="u-h">Close</span>
            ${closeCentralIcon.markup}
        </button>
    </div>
    <div class="support-the-guardian-banner__container">
        <div class="support-the-guardian-banner__text">
            ${params.messageText}${params.ctaText}
        </div>
        <div class="support-the-guardian-banner__cta">
            <button class="button support-the-guardian-banner__button" href="${
                params.linkUrl
            }">
                ${params.buttonCaption}${arrowWhiteRight.markup}
            </button>
            <img
                class="support-the-guardian-banner__payment-logos"
                src="${config.get(
                    'images.acquisitions.paypal-and-credit-card'
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
