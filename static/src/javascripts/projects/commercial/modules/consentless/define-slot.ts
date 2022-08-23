import { renderAdvertLabel } from '../dfp/render-advert-label';

const getOptOutSlotName = (dfpSlotName: string): string => {
	if (dfpSlotName.includes('top-above-nav')) {
		return 'homepage-lead';
	}
	return 'homepage-rect';
};

const defineSlot = (slotId: string): void => {
	window.ootag.queue.push(() => {
		window.ootag.defineSlot({
			adSlot: getOptOutSlotName(slotId),
			targetId: slotId,
			filledCallback: () => {
				const slotElement = document.getElementById(slotId);
				if (slotElement) {
					void renderAdvertLabel(slotElement);
				}
				console.log(`filled consentless ${slotId}`);
			},
			emptyCallback: () => {
				console.log(`empty consentless ${slotId}`);
			},
		});
	});
};

export { defineSlot };
