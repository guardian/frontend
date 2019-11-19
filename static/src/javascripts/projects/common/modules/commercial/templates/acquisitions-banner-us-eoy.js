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
                    </h2>${params.leadSentence}</h2>
                </div>
                <div class="engagement-banner__body">
                    <p>${params.messageText}</p>
                </div>
            </div>
           
            <div class="engagement-banner__cta-container">
                <div class="engagement-banner__cta-heading">
                    <h3>Help us reach our year-end goal</h3>
                </div>
                
                <div class="engagement-banner__ticker-container">
                    ${params.hasTicker ? acquisitionsBannerTickerTemplate : ''}
                </div>
                
                <div class="engagement-banner__cta">
                    <a tabIndex="3" class="button engagement-banner__button" href="${
                        params.linkUrl
                    }">
                        ${params.buttonCaption}
                    </a>
                </div>
                
                <div class="engagement-banner__cta">
                    <a tabIndex="3" class="button engagement-banner__button" href="${
                        params.linkUrl
                    }">
                        ${params.buttonCaption}
                    </a>
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
