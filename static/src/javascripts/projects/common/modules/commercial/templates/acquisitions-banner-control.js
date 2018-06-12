// @flow
export const acquisitionsBannerControlTemplate = (
    params: EngagementBannerTemplateParams
) =>
    `<div class="support-the-guardian-banner__text">
        ${params.messageText}${params.ctaText}
    </div>
    <div class="support-the-guardian-banner__cta">
        <img
            class="support-the-guardian-banner__payment-logos"
            src="${params.paypalAndCreditCardImage}"
            alt="PayPal and credit card"
        >
        <button class="support-the-guardian-banner__button href="${params.linkUrl}">
            ${params.buttonCaption}${params.buttonSvg}
        </button>
    </div>
    <a
        class="u-faux-block-link__overlay"
        target="_blank" href="${params.linkUrl}"
    </a>
    `;
