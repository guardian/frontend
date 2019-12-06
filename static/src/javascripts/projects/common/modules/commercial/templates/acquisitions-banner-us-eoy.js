// @flow

import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import { acquisitionsBannerTickerTemplate } from 'common/modules/commercial/templates/acquisitions-banner-ticker';

export const acquisitionsBannerUsEoyTemplate = (
    params: EngagementBannerTemplateParams
): string => `
        <div class="engagement-banner__close">
            <div class="engagement-banner__roundel hide-until-phablet">
                ${marque36icon.markup}
            </div>
            <button tabindex="4" class="button engagement-banner__close-button js-site-message-close js-engagement-banner-close-button" data-link-name="hide release message">
                <span class="u-h">Close the support banner</span>
                ${closeCentralIcon.markup}
            </button>
        </div>

        <div class="engagement-banner__container engagement-banner__container--us-eoy-2019">
            <div class="engagement-banner__text-container">
                <div class="engagement-banner__header">
                    </h2>${
                        params.titles && params.titles[0]
                            ? params.titles[0]
                            : ''
                    }</h2>
                </div>
                <div class="engagement-banner__body">
                    <p>${params.messageText}
                    <span class="engagement-banner__body-copy--bold">${
                        params.closingSentence ? params.closingSentence : ''
                    }</span>
                    </p>
                </div>
            </div>

            <div class="engagement-banner__cta-container">
                <div class="engagement-banner__ticker-header-container">
                    <h3 class="engagement-banner__ticker-header">${
                        params.tickerHeader ? params.tickerHeader : ''
                    }</h3>
                </div>

                <div class="engagement-banner__ticker-container">
                    ${params.hasTicker ? acquisitionsBannerTickerTemplate : ''}
                </div>

                <div class="engagement-banner__cta">
                    <a tabIndex="3" class="component-button component-button--secondary" href="${
                        params.linkUrl
                    }">
                        ${params.buttonCaption}
                    </a>
                </div>

                <div class="engagement-banner__cta engagement-banner__cta--editorial">
                    <a tabIndex="3" class="component-button component-button--greyHollow component-button--greyHollow--eoy" href="${'https://www.theguardian.com/us-news/2019/nov/18/help-raise-15-million-fund-high-impact-journalism-2020'}">
                        Learn more
                    </a>
                </div>
            </div>
        </div>
    `;
