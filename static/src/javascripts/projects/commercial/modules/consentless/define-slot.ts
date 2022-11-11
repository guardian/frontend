import { log } from '@guardian/libs';
import fastdom from 'fastdom';
import { renderConsentlessAdvertLabel } from './render-advert-label';

const defineSlot = (slot: HTMLElement, slotName: string): void => {
	const slotId = slot.id;

	const filledCallback: OptOutFilledCallback = (_adSlot, response) => {
		log('commercial', `Filled consentless ${slotId}`);
		const { width, height } = response;
		if (width === 1 && height === 1) {
			slot.classList.add('ad-slot--fluid');
		}

		void renderConsentlessAdvertLabel(slot);
	};

	const emptyCallback = () => {
		log('commercial', `Empty consentless ${slotId}`);
		fastdom.mutate(() => {
			slot.remove();
		});
	};

	window.ootag.queue.push(() => {
		window.ootag.defineSlot({
			adSlot: slotName,
			targetId: slotId,
			id: slotId,
			filledCallback,
			emptyCallback,
		});
	});
};

export { defineSlot };
