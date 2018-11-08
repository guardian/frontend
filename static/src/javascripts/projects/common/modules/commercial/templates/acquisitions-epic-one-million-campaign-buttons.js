// @flow
import type { CtaUrls } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';
import { getSync as geolocationGetSync } from 'lib/geolocation';

export const oneMillionCampaignButtonsTemplate = () =>
    `<div class="contributions__buttons contributions__buttons--one-million">
        ${geolocationGetSync() === 'GB' ?
            `<div>
                <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member contributions__contribute--subscribe"
                  href="https://support.theguardian.com/subscribe"
                  target="_blank">
                  Subscribe
                </a>
            </div>
            <div>
                <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
                  href="https://support.theguardian.com/contribute"
                  target="_blank">
                  Contribute
                </a>
            </div>`
            :
            `<div>
                <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
                  href="https://support.theguardian.com/contribute"
                  target="_blank">
                  Support the Guardian
                </a>
            </div>`
        }
        <img class="contributions__payment-logos contributions__contribute--epic-member" src="${config.get(
            'images.acquisitions.paypal-and-credit-card',
            ''
        )}" alt="Paypal and credit card">
    </div>`;
