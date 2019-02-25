// @flow

import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';

export const acquisitionsBannerFivTemplate = (
    params: EngagementBannerTemplateParams
): string => `
    <div class="fiv-banner__container">
        <div class="engagement-banner__close">
            <div class="engagement-banner__roundel">
                ${marque36icon.markup}
            </div>
            <button class="button engagement-banner__close-button js-site-message-close js-engagement-banner-close-button" data-link-name="hide release message">
                <span class="u-h">Close</span>
                ${closeCentralIcon.markup}
            </button>
        </div>
        <div class="fiv-banner__headline-and-circles">
            <div class="fiv-banner__circles">
                <div class="fiv-banner__circle fiv-banner__circle-orange"></div>
                <div class="fiv-banner__circle fiv-banner__circle-blue"></div>
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
        </div>
       
            <div class="fiv-banner__copy-and-ctas">
            <div class="fiv-banner__message">
                <div class="fiv-banner__lead-sentence">
                   ${params.leadSentence || ''}
                </div>
                <div class="fiv-banner__message-text">
                   ${params.messageText} 
                </div>
            </div>
            <div class="engagement-banner__cta">
                <a class="button engagement-banner__button engagement-banner__button__support" href="${
                    params.linkUrl
                }">
                    ${params.buttonCaption}
                </a>
                <a class="button engagement-banner__button engagement-banner__button__learn-more js-engagement-banner-close-button js-site-message-close" href="https://www.theguardian.com/membership/2019/feb/20/katharine-viner-qanda-journalists-readers-guardian-future?INTCMP=fiv_banner">
                    Learn more
                </a>
            </div>
        </div>
    </div>
    `;
