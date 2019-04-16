// @flow

import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import arrowWhiteRight from 'svgs/icon/arrow-white-right.svg';
import applyPayMark from 'svgs/acquisitions/apple-pay-mark.svg';
import config from 'lib/config';
import { applePayApiAvailable } from 'lib/detect';
import { acquisitionsBannerTickerTemplate } from 'common/modules/commercial/templates/acquisitions-banner-ticker';

export const acquisitionsBannerControlTemplate = (
    params: EngagementBannerTemplateParams
): string => {
    const applePayLogo = applePayApiAvailable ? applyPayMark.markup : '';
    return `
        <div class="engagement-banner__close">
            <div class="engagement-banner__roundel">
                ${marque36icon.markup}
            </div>
            <button class="button engagement-banner__close-button js-site-message-close js-engagement-banner-close-button" data-link-name="hide release message">
                <span class="u-h">Close</span>
                ${closeCentralIcon.markup}
            </button>
        </div>
        <div class="engagement-banner__container">
            <div class="engagement-banner__text">
                ${params.messageText}${params.ctaText}
                ${params.hasTicker ? acquisitionsBannerTickerTemplate : ''}
            </div>
            <div class="engagement-banner__cta">
                <button class="button engagement-banner__button" href="${
                    params.linkUrl
                }">
                    ${params.buttonCaption}${arrowWhiteRight.markup}
                </button>
                <div class="engagement-banner__payment-logos">
                    <img
                        src="${config.get(
                            'images.acquisitions.payment-methods',
                            ''
                        )}"
                        alt="PayPal and credit card"
                    >
                    ${applePayLogo}
                </div>
            </div>
        </div>
        <a
            class="u-faux-block-link__overlay"
            target="_blank"
            href="${params.linkUrl}"
        ></a>
    `;
};
