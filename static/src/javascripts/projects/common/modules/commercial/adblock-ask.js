// @flow

import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';

import { supportSubscribeDigitalURL } from 'common/modules/commercial/support-utilities';
import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';
import { pageShouldHideReaderRevenue } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';

const supportUrl = `${supportSubscribeDigitalURL()}?acquisitionData=%7B%22componentType%22%3A%22ACQUISITIONS_OTHER%22%2C%22source%22%3A%22GUARDIAN_WEB%22%2C%22campaignCode%22%3A%22shady_pie_open_2019%22%2C%22componentId%22%3A%22shady_pie_open_2019%22%7D&INTCMP=shady_pie_open_2019`;

const askHtml = `
<div class="contributions__adblock">
    <div class="contributions__adblock-content">
        <div class="contributions__adblock-header">
            <h2>
                Read The<br>
                Guardian without<br>
                interruption on all<br>
                your devices
            </h2>
        </div>
        <a class="contributions__adblock-button" href="${supportUrl}">
            <span class="component-button__content">Subscribe now</span>
        </a>
        <img src="https://media.guim.co.uk/b437f809d9fa4c72336ccbead1730b6bb0965239/0_0_432_503/432.png" class="contributions__adblock-image" alt="" />
    </div>
</div>
`;

const canShow = () =>
    !shouldHideSupportMessaging() &&
    !pageShouldHideReaderRevenue() &&
    !config.get('page.hasShowcaseMainElement');

export const initAdblockAsk = () => {
    fastdom
        .read(() => $('.js-aside-slot-container'))
        .then(slot => {
            if (canShow()) {
                return fastdom.write(() => {
                    slot.append(askHtml);
                });
            }
        });
};
