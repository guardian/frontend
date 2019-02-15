// @flow

import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';

export const acquisitionsBannerFivTemplate = (
    params: EngagementBannerTemplateParams
): string => `
        <div class="engagement-banner__close">
            <div class="engagement-banner__roundel">
                ${marque36icon.markup}
            </div>
            <button class="button engagement-banner__close-button js-site-message-close js-engagement-banner-close-button" data-link-name="hide release message">
                <span class="u-h">Close</span>
                ${closeCentralIcon.markup}
            </button>
        </div>
        ${
            params.titles
                ? `<div class="fiv-banner__headline">
            <div class="fiv-banner__headline1">
    ${params.titles[0]}
            </div>
            <div class="fiv-banner__headline2">
                ${params.titles[1]}
            </div>
        </div>`
                : ''
        }

        <div class="fiv-banner__circles">
            <div class="fiv-banner__circle fiv-banner__circle1"></div>
            <div class="fiv-banner__circle fiv-banner__circle2 fiv-banner__circle2-clear"></div>
            <div class="fiv-banner__circle fiv-banner__circle2 fiv-banner__circle2-mask"></div>
        </div>
        <div class="fiv-banner__container">
            <div class="fiv-banner__text">
                HIHIHI ${params.messageText}${params.ctaText}
            </div>
            <div class="engagement-banner__cta">
                <button class="button engagement-banner__button" href="${
                    params.linkUrl
                }">
                    ${params.buttonCaption}
                </button>
                <button class="button engagement-banner__read-more" href="${
                    params.linkUrl
                }">
                    FIX LINK
                </button>
            </div>
        </div>
        <a
            class="u-faux-block-link__overlay"
            target="_blank"
            href="${params.linkUrl}"
        ></a>
    `;
