import { log } from '@guardian/libs';
import fastdom from 'fastdom';
import { renderConsentlessAdvertLabel } from './render-advert-label';

const defineSlot = (slot: HTMLElement, slotName: string): void => {
	const slotId = slot.id;

	const filledCallback = () => {
		log('commercial', `Filled consentless ${slotId}`);
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
