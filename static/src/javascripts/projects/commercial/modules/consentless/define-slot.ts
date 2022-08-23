import { renderAdvertLabel } from '../dfp/render-advert-label';

const isArticle = window.guardian.config.page.contentType === 'Article';
const isFront = window.guardian.config.page.isFront;

const getOptOutSlotName = (slotName: string, inlineId?: number): string => {
	// front, liveblog, article inlines all have slightly different mappings, so we prefix them
	if (slotName === 'inline') {
		if (isArticle) {
			// article inlines are suffixed with 1 for inline1 and 2-plus for all other inlines as they have different size mappings
			return `article-inline${inlineId === 1 ? '1' : '2-plus'}`;
		}
		return `${isFront ? 'front-' : 'liveblog-'}${slotName}`;
	} else {
		return slotName;
	}
};

const defineSlot = (
	slotId: string,
	slotName: string,
	inlineId?: number,
): void => {
	window.ootag.queue.push(() => {
		window.ootag.defineSlot({
			adSlot: getOptOutSlotName(slotName, inlineId),
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
