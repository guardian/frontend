import { createAdSlot } from '@guardian/commercial-core';
import fastdom from '../../../lib/fastdom-promise';
import { addSlot } from './dfp/add-slot';
import { shouldIncludeMobileSticky } from './header-bidding/utils';

const createAdWrapperClassic = () => {
	const wrapper = document.createElement('div');
	wrapper.className = 'mobilesticky-container';
	const adSlot = createAdSlot('mobile-sticky', {});
	wrapper.appendChild(adSlot);
	return wrapper;
};

const createAdWrapperDCR = () => {
	const wrapper = document.querySelector('.mobilesticky-container');
	if (wrapper) {
		const adSlot = createAdSlot('mobile-sticky', {});
		wrapper.appendChild(adSlot);
	}
	return wrapper;
};

const createAdWrapper = () => {
	if (!window.guardian.config.isDotcomRendering) {
		return createAdWrapperClassic();
	}
	return createAdWrapperDCR();
};

/**
 * Initialise mobile sticky ad slot
 * @returns Promise
 */
export const init = (): Promise<void> => {
	if (shouldIncludeMobileSticky()) {
		const mobileStickyWrapper = createAdWrapper();
		return fastdom
			.mutate(() => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Is body really always defined?
				if (document.body && mobileStickyWrapper)
					document.body.appendChild(mobileStickyWrapper);
			})
			.then(() => {
				if (mobileStickyWrapper) {
					const mobileStickyAdSlot =
						mobileStickyWrapper.querySelector<HTMLElement>(
							'#dfp-ad--mobile-sticky',
						);
					if (mobileStickyAdSlot) addSlot(mobileStickyAdSlot, true);
				}
			});
	}

	return Promise.resolve();
};
