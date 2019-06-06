// @flow

import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import arrowWhiteRight from 'svgs/icon/arrow-white-right.svg';
import config from 'lib/config';
import { acquisitionsBannerTickerTemplate } from 'common/modules/commercial/templates/acquisitions-banner-ticker';

export const acquisitionsBannerSignInCtaTemplate = (
    params: EngagementBannerTemplateParams
): string => `
        <div class="engagement-banner__close">
            <div class="engagement-banner__roundel">
                ${marque36icon.markup}
            </div>
            <button tabindex="5" class="button engagement-banner__close-button js-site-message-close js-engagement-banner-close-button" data-link-name="hide release message">
                <span class="u-h">Close the support banner</span>
                ${closeCentralIcon.markup}
            </button>
        </div>
        <div class="engagement-banner__container">
            <div class="engagement-banner__text">
                ${params.messageText}${params.ctaText}
                ${params.hasTicker ? acquisitionsBannerTickerTemplate : ''}
            </div>
            <div class="engagement-banner__cta">
                <div class="engagement-banner__payment-cta">
                    <a tabindex="3"     class="button engagement-banner__button engagement-banner__button--before-logos" href="${
                        params.linkUrl
                    }">
                        ${params.buttonCaption}${arrowWhiteRight.markup}
                    </a>
                    <div class="engagement-banner__payment-logos">
                        <img
                            src="${config.get(
                                'images.acquisitions.payment-methods',
                                ''
                            )}"
                            alt="Accepted paym  ent methods: Visa, Mastercard, American Express and Paypal"
                        >
                    </div>
                    <a tabindex="3" class="button engagement-banner__button engagement-banner__button--after-logos" href="${
                        params.linkUrl
                    }">
                        ${params.buttonCaption}${arrowWhiteRight.markup}
                    </a>
                </div>
                <div class="engagement-banner__sign-in-cta">
                    <a tabindex="4" class="engagement-banner__sign-in-cta-link u-underline js-engagement-banner-close-button" href="${
                        params.signInUrl ? params.signInUrl : ''
                    }">Already a supporter? Sign in</a>
                </div>
            </div>
        </div>
        <a
            aria-hidden="true"
            class="u-faux-block-link__overlay"
            target="_blank"
            href="${params.linkUrl}"
        ></a>
    `;
