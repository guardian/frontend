// @flow
import type { CtaUrls } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';

export const epicButtonsSplitCtaTemplate = ({
    membershipUrl = '',
}: CtaUrls): string => {
    const contribButton = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
             href="${membershipUrl}&bundle=contribute"
             target="_blank">
             Make a contribution
            </a>
        </div>`;
    const subscribeButton = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
              href="${membershipUrl}&bundle=subscribe"
              target="_blank">
              Get a subscription
            </a>
        </div>`;

    const paymentLogos = `<img class="contributions__payment-logos contributions__contribute--epic-member" src="${config.get(
        'images.acquisitions.paypal-and-credit-card',
        ''
    )}" alt="Paypal and credit card">`;

    return `
        <div class="contributions__amount-field">
            ${contribButton}
            ${subscribeButton}
            ${paymentLogos}
        </div>`;
};
