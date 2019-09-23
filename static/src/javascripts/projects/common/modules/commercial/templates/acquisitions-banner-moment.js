// @flow

import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import arrowWhiteRight from 'svgs/icon/arrow-white-right.svg';

export const acquisitionsBannerMomentTemplate = (
    params: EngagementBannerTemplateParams
): string => `
    <div class="engagement-banner__close">
        <div class="engagement-banner__roundel hide-until-phablet">
            ${marque36icon.markup}
        </div>
        <button tabindex="4" class="button engagement-banner__close-button js-site-message-close js-engagement-banner-close-button" data-link-name="hide release message">
            <span class="u-h">Close the moment banner</span>
            ${closeCentralIcon.markup}
        </button>
    </div>
    
    <div class="moment-banner__container">
        <div class="moment-banner__graphic-container">
            <img class="moment-banner__graphic"
                srcset="https://media.guim.co.uk/ae6379efd4343894529e3b03672549a3206f2ea5/0_0_289_420/289.png, 
                https://media.guim.co.uk/8fe60bf9d30df8481fcbccb91816a3c995279007/0_0_577_840/577.png 2x" 
                src="https://media.guim.co.uk/ae6379efd4343894529e3b03672549a3206f2ea5/0_0_289_420/289.png" 
                alt="Support the Guardian" 
            />
        </div>
        
        <div class="moment-banner__text-container"> 
            <div class="moment-banner__titles">
                ${
                    params.titles && params.titles[0]
                        ? `<h2 class="moment-banner__title-one">${
                              params.titles[0]
                          }</h2>`
                        : ''
                }
                ${
                    params.titles && params.titles[1]
                        ? `<h2 class="moment-banner__title-two">${
                              params.titles[1]
                          }</h2>`
                        : ''
                }
            </div>
            
            <div class="moment-banner__copy">
                <!-- Render bold lead sentence if it exists -->
                ${
                    params.leadSentence
                        ? `<span class="moment-banner__copy-in-bold">${
                              params.leadSentence
                          }</span>`
                        : ''
                }
                
                <!-- Render main message text -->
                <span class="hide-until-tablet">${params.messageText}</span>
                
                <!-- Render mobile text if it exists, else render main text -->
                ${
                    params.mobileMessageText
                        ? `<span class="hide-from-tablet">${
                              params.mobileMessageText
                          }</span>`
                        : `<span class="hide-from-tablet">${
                              params.messageText
                          }</span>`
                }
                
                <!-- Render bold closing sentence if it exists-->
                ${
                    params.closingSentence
                        ? `<span class="moment-banner__copy-in-bold">${
                              params.closingSentence
                          }</span>`
                        : ''
                }
            </div>

            <div class="moment-banner__buttons">
                <div class="engagement-banner__cta">
                    <a tabindex="3" class="button  engagement-banner__button  engagement-banner__button--moment-link" href="${
                        params.linkUrl
                    }">
                        Read our pledge
                    </a>
                </div>
                
                <div class="engagement-banner__cta">
                    <a tabindex="3" class="button engagement-banner__button" href="${
                        params.linkUrl
                    }">
                    ${params.buttonCaption}${arrowWhiteRight.markup}
                    </a>
                </div>
            </div>
        </div>
    </div>
    `;
