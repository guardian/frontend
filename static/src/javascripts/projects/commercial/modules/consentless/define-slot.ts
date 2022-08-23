import { renderAdvertLabel } from '../dfp/render-advert-label';

const getOptOutSlotName = (slotName: string, inlineId?: number): string => {
	if (window.guardian.config.page.isFront && slotName === 'inline') {
		return 'front-inline';
	} else if (slotName === 'inline') {
		if (window.guardian.config.page.contentType === 'Article') {
			if (inlineId === 1) {
				return 'article-inline1';
			} else {
				return 'article-inline2-plus';
			}
		} else if (window.guardian.config.page.isLiveBlog) {
			return 'liveblog-inline';
		}
	}
	return slotName;
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
