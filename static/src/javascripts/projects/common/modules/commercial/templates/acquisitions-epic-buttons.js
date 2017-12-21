// @flow
import type { CtaUrls } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';

export const epicButtonsTemplate = (
    { supportUrl = '', contributeUrl = '' }: CtaUrls,
    useSupportDomain: boolean = false
) => {
    const contribButton = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
             href="${contributeUrl}"
             target="_blank">
             Make a contribution
            </a>
        </div>`;
    const supportButtonBecome = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
              href="${supportUrl}"
              target="_blank">
              Become a supporter
            </a>
        </div>`;
    const supportButtonSupport = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member contributions__contribute--epic-single-button"
              href="${supportUrl}"
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
            ${
                useSupportDomain
                    ? supportButtonSupport
                    : supportButtonBecome + contribButton
            }
            ${paymentLogos}
        </div>`;
};
