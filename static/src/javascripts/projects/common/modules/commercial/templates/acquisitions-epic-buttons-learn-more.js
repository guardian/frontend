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
            <a class="component-button component-button--primary component-button--hasicon-right contributions__contribute--epic-member"
              href="${supportUrl}"
              target="_blank">
                ${ctaText}
                <svg
                class="svg-arrow-right-straight"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 17.89"
                preserveAspectRatio="xMinYMid"
                aria-hidden="true"
                focusable="false"
                >
                    <path d="M20 9.35l-9.08 8.54-.86-.81 6.54-7.31H0V8.12h16.6L10.06.81l.86-.81L20 8.51v.84z" />
                </svg>
            </a>`;

    const learnMoreButton = `
            <a class="component-button component-button--greyHollow component-button--greyHollow--for-epic component-button--hasicon-right contributions__contribute--epic-member contributions__learn-more contributions__learn-more--epic"
              href="https://www.theguardian.com/membership/2018/nov/15/support-guardian-readers-future-journalism?INTCMP=why_support_us"
              target="_blank">
              Why support matters
              <svg
                class="svg-arrow-right-straight"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 17.89"
                preserveAspectRatio="xMinYMid"
                aria-hidden="true"
                focusable="false"
                >
                    <path d="M20 9.35l-9.08 8.54-.86-.81 6.54-7.31H0V8.12h16.6L10.06.81l.86-.81L20 8.51v.84z" />
                </svg>
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
