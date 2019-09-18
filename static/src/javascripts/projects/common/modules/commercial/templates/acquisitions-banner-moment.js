// @flow

import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import { applePayApiAvailable } from 'lib/detect';
import applyPayMark from 'svgs/acquisitions/apple-pay-mark.svg';
import arrowWhiteRight from 'svgs/icon/arrow-white-right.svg';
import config from 'lib/config';

export const acquisitionsBannerMomentTemplate = (
    params: EngagementBannerTemplateParams
): string => {
    const applePayLogo = applePayApiAvailable ? applyPayMark.markup : '';
    return `
    <div class="engagement-banner__close">
        <div class="engagement-banner__roundel hide-until-phablet">
            ${marque36icon.markup}
        </div>
        <button tabindex="4" class="button engagement-banner__close-button js-site-message-close js-engagement-banner-close-button" data-link-name="hide release message">
            <span class="u-h">Close the moment banner</span>
            ${closeCentralIcon.markup}
        </button>
    </div>
    
    <div class="fiv-banner__container">
        <div class="fiv-banner__graphic">
        </div>
        
        <div class="fiv-banner__titles">
            <h2>${params.titles[0]}</h2>
            <h2>${params.titles[1]}</h2>
        </div>
        
        <div class="fiv-banner__copy">
            <span>${params.leadSentence}</span>
            <span>${params.messageText}</span>
        </div>
        
        <div class="fiv-banner__buttons">
<div class="engagement-banner__cta">
<a tabindex="3" class="button engagement-banner__button" href="${
        params.linkUrl
    }">
${params.buttonCaption}${arrowWhiteRight.markup}
</a>
<div class="engagement-banner__payment-logos">
<img src="${config.get('images.acquisitions.payment-methods', '')}"
alt="Accepted payment methods: Visa, Mastercard, American Express and Paypal"
>
${applePayLogo}
                </div>
            </div>
        </div>
    </div>
    `;
};
