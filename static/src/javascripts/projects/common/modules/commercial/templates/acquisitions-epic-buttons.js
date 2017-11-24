// @flow
import type { CtaUrls } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';

export const epicButtonsTemplate = (
    { membershipUrl = '', contributeUrl = '' }: CtaUrls,
    useSupportDomain: boolean = false,
    suffix: string = ''
) => {
    const contribButton = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
             href="${contributeUrl}"
             target="_blank">
             Make a contribution ${suffix}
            </a>
        </div>`;
    const supportButtonBecome = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
              href="${membershipUrl}"
              target="_blank">
              Become a supporter ${suffix}
            </a>
        </div>`;
    const supportButtonSupport = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member contributions__contribute--epic-single-button"
              href="${membershipUrl}"
              target="_blank">
              Support the Guardian ${suffix}
            </a>
        </div>`;

    const paymentLogos = `<img class="contributions__payment-logos contributions__contribute--epic-member" src="${config.get(
        'images.acquisitions.paypal-and-credit-card',
        ''
    )}" alt="Paypal and credit card">`;

    return `
        <div class="contributions__amount-field">
            ${!useSupportDomain ? supportButtonBecome : supportButtonSupport}
            ${!useSupportDomain ? contribButton : ''}
            ${paymentLogos}
        </div>`;
};
