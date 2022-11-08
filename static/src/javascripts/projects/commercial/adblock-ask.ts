import fastdom from '../../lib/fastdom-promise';
import { supportSubscribeDigitalURL } from '../common/modules/commercial/support-utilities';

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

// Hard coded to disable for new product launch
const canShow = (): boolean => false;

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
