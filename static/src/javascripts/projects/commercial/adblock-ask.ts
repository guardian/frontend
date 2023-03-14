/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import fastdom from '../../lib/fastdom-promise';
import { pageShouldHideReaderRevenue } from '../common/modules/commercial/contributions-utilities';
import { supportSubscribeDigitalURL } from '../common/modules/commercial/support-utilities';
import { shouldHideSupportMessaging } from '../common/modules/commercial/user-features';

const params = new URLSearchParams();
params.set(
	'acquisitionData',
	JSON.stringify({
		componentType: 'ACQUISITIONS_OTHER',
		source: 'GUARDIAN_WEB',
		campaignCode: 'shady_pie_open_2019',
		componentId: 'shady_pie_open_2019',
	}),
);
params.set('INTCMP', 'shady_pie_open_2019');

const supportUrl = `${supportSubscribeDigitalURL()}?${params.toString()}`;

const askHtml = `
<div class="contributions__adblock">
    <a href="${supportUrl}">
        <img src="https://uploads.guim.co.uk/2020/10/02/Digisubs_MPU_c1_my_opt.png" width="300" alt="" />
    </a>
</div>
`;

const canShow = (): boolean =>
	!shouldHideSupportMessaging() &&
	!pageShouldHideReaderRevenue() &&
	!window.guardian.config.page.hasShowcaseMainElement;

/**
 * Initialise adblock ask a.k.a Shady Pie
 * Shows a message with a discounted subscription to users who have ad blockers enabled
 * @returns Promise
 */
export const initAdblockAsk = (): Promise<void> => {
	if (!canShow()) return Promise.resolve();

	return fastdom
		.measure(() => document.querySelector('.js-aside-slot-container'))
		.then((slot) => {
			if (!slot) return;
			return fastdom.mutate(() => {
				slot.insertAdjacentHTML('beforeend', askHtml);
			});
		});
};

export const _ = {
	params,
	canShow,
};
