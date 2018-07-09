// @flow
import config from 'lib/config';
import arrowWhiteRight from 'svgs/icon/arrow-white-right.svg';

export const acquisitionsBannerTemplateOldStyling = (
    params: EngagementBannerTemplateParams
): string =>
    `<div id="site-message__message">
        <div class="site-message__message site-message__message--membership">
            <div class="membership__message-text-long">
                <span class = "membership__message-text">
                    ${params.messageText}${params.ctaText}
                </span>
            </div>
            <span class="membership__paypal-container">
                <img
                    class="membership__paypal-logo"
                    src="${config.get(
                        'images.acquisitions.paypal-and-credit-card',
                        ''
                    )}"
                    alt="Paypal and credit card"
                >
                <span class="membership__support-button">
                    <a
                        class="message-button-rounded__cta membership-prominent yellow"
                        href="${params.linkUrl}"
                    >
                        ${params.buttonCaption}${arrowWhiteRight.markup}
                    </a>
                </span>
            </span>
        </div>
        <a
            class="u-faux-block-link__overlay js-engagement-message-link"
            target="_blank"
            href="${params.linkUrl}"
            data-link-name="Read more link"
        ></a>
    </div>`;
