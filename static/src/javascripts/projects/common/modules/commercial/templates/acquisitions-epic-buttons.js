// @flow
import config from 'lib/config';
import { applePayApiAvailable } from 'lib/detect';
import applyPayMark from 'svgs/acquisitions/apple-pay-mark.svg';

export const epicButtonsTemplate = (
    { supportUrl = '' }: CtaUrls,
    ctaText?: string = 'Support The Guardian'
) => {
    const applePayLogo = applePayApiAvailable ? applyPayMark.markup : '';

    const supportButtonSupport = `
        <div>
            <a class="component-button contributions__contribute--epic-member"
              href="${supportUrl}"
              target="_blank">
              ${ctaText}
            </a>
        </div>`;

    const paymentLogos = `<div class="contributions__payment-logos contributions__contribute--epic-member">
        <img src="${config.get(
            'images.acquisitions.payment-methods',
            ''
        )}" alt="Accepted payment methods: Visa, Mastercard, American Express and Paypal">
        ${applePayLogo}
    </div>`;

    return `
        <div class="contributions__buttons">
            ${supportButtonSupport}
            ${paymentLogos}
        </div>`;
};
