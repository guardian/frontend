// @flow

import fastdom from 'lib/fastdom-promise';
import { $ } from 'lib/$';

import { supportSubscribeDigitalURL } from 'common/modules/commercial/support-utilities';
import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';
import { pageShouldHideReaderRevenue } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';

const supportUrl = `${supportSubscribeDigitalURL()}?acquisitionData=%7B%22componentType%22%3A%22ACQUISITIONS_OTHER%22%2C%22source%22%3A%22GUARDIAN_WEB%22%2C%22campaignCode%22%3A%22shady_pie_open_2019%22%2C%22componentId%22%3A%22shady_pie_open_2019%22%7D&INTCMP=shady_pie_open_2019`;

const askHtml = `
<div class="contributions__adblock">
    <a href="${supportUrl}">
        <img src="https://uploads.guim.co.uk/2020/10/02/Digisubs_MPU_c1_my_opt.png" width="300" alt="" />
    </a>
</div>
`;

const canShow = () =>
    !shouldHideSupportMessaging() &&
    !pageShouldHideReaderRevenue() &&
    !config.get('page.hasShowcaseMainElement');

export const initAdblockAsk = () => {
    if (canShow()) {
        fastdom
            .read(() => $('.js-aside-slot-container'))
            .then(slot => {
                if (slot) {
                    fastdom.write(() => {
                        slot.append(askHtml);
                    });
                }
            });
    }
};
