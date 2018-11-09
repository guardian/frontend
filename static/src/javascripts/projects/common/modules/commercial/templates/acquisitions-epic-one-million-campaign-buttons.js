// @flow
import config from 'lib/config';
import { getSync as geolocationGetSync } from 'lib/geolocation';

export const oneMillionCampaignButtonsTemplate = ({ supportUrl, subscribeUrl }: { supportUrl: string, subscribeUrl: string }) =>
    `<div class="contributions__buttons contributions__buttons--one-million">
        ${
            geolocationGetSync() === 'GB' || geolocationGetSync() === 'AU'
                ? `<div>
                       <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member contributions__contribute--one-million-subscribe"
                         href="${subscribeUrl}"
                         target="_blank">
                         Subscribe
                       </a>
                   </div>
                   <div>
                       <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
                         href="${supportUrl}"
                         target="_blank">
                         Contribute
                       </a>
                   </div>`
                : `<div>
                       <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
                         href="${supportUrl}"
                         target="_blank">
                         Support The Guardian
                       </a>
                   </div>`
        }
        <img class="contributions__payment-logos contributions__contribute--epic-member" src="${config.get(
            'images.acquisitions.paypal-and-credit-card',
            ''
        )}" alt="Paypal and credit card">
    </div>`;
