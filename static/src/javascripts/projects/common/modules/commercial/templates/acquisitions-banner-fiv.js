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
            <div class="fiv-banner__circle fiv-banner__circle1"></div>
            <div class="fiv-banner__circle fiv-banner__circle2 fiv-banner__circle2-clear"></div>
            <div class="fiv-banner__circle fiv-banner__circle2 fiv-banner__circle2-mask"></div>
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
       
        <div class="fiv-banner__copy-and-ctas">
            <div class="fiv-banner__message">
                <div class="fiv-banner__lead-sentence">
                   This is The Guardian’s model for open, independent journalism
                </div>
                <div class="fiv-banner__message-text">
                    Our mission is to keep independent journalism accessible to everyone, regardless of where they live or what they can afford. Funding from our readers safeguards our editorial independence. It also powers our work and maintains this openness. It means more people, across the world, can access accurate information with integrity at its heart. 
                </div>
            </div>
            <div class="engagement-banner__cta">
                <button class="button engagement-banner__button" href="${
                    params.linkUrl
                }">
                    ${params.buttonCaption}
                </button>
                <button class="button engagement-banner__button engagement-banner__button__read-more" href="${
                    params.linkUrl
                }">
                    Read more
                </button>
            </div>
        </div>
       <!--<a
            class="u-faux-block-link__overlay"
            target="_blank"
            href="${params.linkUrl}"
        ></a>-->
    </div>
    `;
