// @flow
export const acquisitionsBannerControlTemplate = (
    params: EngagementBannerTemplateParams
) =>
    `<div id="site-message__message">
        <div class="site-message__message site-message__message--membership">
            <div class="membership__message-text-long">
                <span class = "membership__message-text">
                    ${params.messageText} <strong>${
        params.ctaText
    }</strong></span>
            </div>
            <span class="membership__paypal-container">
                <img class="membership__paypal-logo" src="${
                    params.paypalAndCreditCardImage
                }" alt="Paypal and credit card">
                <span class="membership__support-button"><a class="message-button-rounded__cta ${
                    params.colourClass
                }" href="${params.linkUrl}">${params.buttonCaption}${
        params.buttonSvg
    }</a></span>
            </span>
        </div>
        <a class="u-faux-block-link__overlay js-engagement-message-link" target="_blank" href="${
            params.linkUrl
        }" data-link-name="Read more link"></a>
    </div>`;
