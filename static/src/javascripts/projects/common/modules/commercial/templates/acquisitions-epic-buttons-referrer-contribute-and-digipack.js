// @flow
import type { CtaUrls } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';

export const epicButtonsReferrerContributeAndDigipackTemplate = ({
    supportUrl = '',
}: CtaUrls) => {
    const button = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member contributions__contribute--epic-single-button"
             href="${supportUrl}&bundle=contribute-and-digipack"
             target="_blank">
             Support the Guardian
            </a>
        </div>`;

    const paymentLogos = `<img class="contributions__payment-logos contributions__contribute--epic-member" src="${config.get(
        'images.acquisitions.paypal-and-credit-card',
        ''
    )}" alt="Paypal and credit card">`;

    return `
        <div class="contributions__amount-field">
            ${button}
            ${paymentLogos}
        </div>`;
};
