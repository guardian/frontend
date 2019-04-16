// @flow
import config from 'lib/config';
import { applePayApiAvailable } from 'lib/detect';
import applyPayMark from 'svgs/acquisitions/apple-pay-mark.svg';

export const epicButtonsTemplate = ({ supportUrl = '' }: CtaUrls) => {
    const applePayLogo = applePayApiAvailable ? applyPayMark.markup : '';

    const supportButtonSupport = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
              href="${supportUrl}"
              target="_blank">
              Support The Guardian
            </a>
        </div>`;

    const paymentLogos = `<div class="contributions__payment-logos contributions__contribute--epic-member">
        <img src="${config.get(
            'images.acquisitions.payment-methods',
            ''
        )}" alt="Paypal and credit card">
        ${applePayLogo}
    </div>`;

    return `
        <div class="contributions__buttons">
            ${supportButtonSupport}
            ${paymentLogos}
        </div>`;
};
