// @flow
import config from 'lib/config';
import { applePayApiAvailable } from 'lib/detect';
import applyPayMark from 'svgs/acquisitions/apple-pay-mark.svg';

export const epicButtonsLearnMoreTemplate = (
    { supportUrl = '' }: CtaUrls,
    ctaText?: string = 'Support The Guardian'
) => {
    const applePayLogo = applePayApiAvailable ? applyPayMark.markup : '';

    const supportButtonSupport = `
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
              href="${supportUrl}"
              target="_blank">
              ${ctaText}
            </a>`;

    const learnMoreButton = `
            <a class="contributions__option-button contributions__learn-more contributions__learn-more--epic contributions__contribute--epic-member"
              href="https://www.theguardian.com/membership/2018/nov/15/support-guardian-readers-future-journalism?INTCMP=why_support_us"
              target="_blank">
              Why support matters
            </a>`;

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
            ${learnMoreButton}
            ${paymentLogos}
        </div>`;
};
