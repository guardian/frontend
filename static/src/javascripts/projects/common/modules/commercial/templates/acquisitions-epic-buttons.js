// @flow
import { paymentMethodLogosTemplate } from 'common/modules/commercial/templates/payment-method-logos-template';

export const epicButtonsTemplate = (
    { supportUrl = '' }: CtaUrls,
    ctaText?: string = 'Support The Guardian'
) => {
    const supportButtonSupport = `
        <div>
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
            </a>
        </div>`;

    return `
        <div class="contributions__buttons">
            ${supportButtonSupport}
            ${paymentMethodLogosTemplate(
                'contributions__payment-logos contributions__contribute--epic-member'
            )}
        </div>`;
};
