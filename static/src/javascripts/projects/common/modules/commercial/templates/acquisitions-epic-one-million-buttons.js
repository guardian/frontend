// @flow
import type { CtaUrls } from 'common/modules/commercial/contributions-utilities';
import { getSync } from 'lib/geolocation';
import config from 'lib/config';

const isInUK = getSync() === 'GB';

// TODO: test & double check this geolocate is suitable

export const epicButtonsOneMillionTemplate = ({ supportUrl = '' }:CtaUrls, subscribeUrl: string = '')  => {
    const supportButtonSupport = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member contributions__contribute--epic-single-button"
              href="${supportUrl}"
              target="_blank">
              Support The Guardian
            </a>
        </div>`;

    const subscribeButton = `
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member contributions__contribute--epic-single-button contributions__contribute--epic-subscribe-button"
              href="${subscribeUrl}"
              target="_blank">
              Subscribe to The Guardian
            </a>
        </div>`;

    const paymentLogos = `<img class="contributions__payment-logos contributions__contribute--epic-member" src="${config.get(
        'images.acquisitions.paypal-and-credit-card',
        ''
    )}" alt="Paypal and credit card">`;

    if (isInUK) {
        return `
        <div class="contributions__amount-field">
            ${supportButtonSupport}
            ${subscribeButton}
            ${paymentLogos}
        </div>`;
    } else {
        return `
        <div class="contributions__amount-field">
            ${supportButtonSupport}
            ${paymentLogos}
        </div>`;
    }
};
