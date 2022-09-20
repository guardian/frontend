import { renderAdvertLabel } from '../dfp/render-advert-label';

const defineSlot = (slotId: string, slotName: string): void => {
	window.ootag.queue.push(() => {
		window.ootag.defineSlot({
			adSlot: slotName,
			targetId: slotId,
			id: slotId,
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
