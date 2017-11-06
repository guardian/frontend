// @flow
export const acquisitionsBannerControlTemplate = (
    params: EngagementBannerTemplateParams
) =>
    `<div id="site-message__message long-test">
        <div class="site-message__message site-message__message--membership long-test">
            <div class="membership__message-text-long">
                <span class = "membership__message-text">
                    <strong>Unlike many news organisations, we haven't put up a paywall - we want to keep our journalism as open as we can.</strong>
                    The Guardian's independent, investigative journalism
                takes a lot of time, money and hard work to produce. But the revenue we get from advertising is falling,
                so we increasingly need our readers to fund us. If everyone who reads our reporting, who likes it, helps
                fund it, our future would be much more secure. <strong>${params.ctaText}</strong></span>
            </div>
            <span class="membership__paypal-container">
                <img class="membership__paypal-logo" src="${params.paypalAndCreditCardImage}" alt="Paypal and credit card">
                <span class="membership__support-button"><a class="message-button-rounded__cta ${params.colourClass}" href="${params.linkUrl}">${params.buttonCaption}${params.buttonSvg}</a></span>
            </span>
        </div>
        <a class="u-faux-block-link__overlay js-engagement-message-link" target="_blank" href="${params.linkUrl}" data-link-name="Read more link"></a>
    </div>`;
