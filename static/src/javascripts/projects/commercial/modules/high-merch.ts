import config from '../../../lib/config';
import fastdom from '../../../lib/fastdom-promise';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { createAdSlot } from './dfp/create-slot';

/**
 * Initialise high merch ad slot
 * @returns Promise
 */
export const init = (): Promise<void> => {
	if (commercialFeatures.highMerch) {
		const anchorSelector = config.get('page.commentable')
			? '#comments + *'
			: '.content-footer > :first-child';
		const anchor = document.querySelector(anchorSelector);
		const container = document.createElement('div');

		container.className = 'fc-container fc-container--commercial';
		const slot = createAdSlot(
			window.guardian.config.page.isPaidContent
				? 'high-merch-paid'
				: 'high-merch',
		);

		container.appendChild(slot);

		return fastdom.mutate(() => {
			if (anchor?.parentNode) {
				anchor.parentNode.insertBefore(container, anchor);
			}
		});
	}

	return Promise.resolve();
};
