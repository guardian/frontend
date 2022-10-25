import { renderConsentlessAdvertLabel } from './render-advert-label';

const defineSlot = (slot: HTMLElement, slotName: string): void => {
	const slotId = slot.id;

	window.ootag.queue.push(() => {
		window.ootag.defineSlot({
			adSlot: slotName,
			targetId: slotId,
			id: slotId,
			filledCallback: () => {
				void renderConsentlessAdvertLabel(slot);
				console.log(`filled consentless ${slotId}`);
			},
			emptyCallback: () => {
				console.log(`empty consentless ${slotId}`);
			},
		});
	});
};

export { defineSlot };
