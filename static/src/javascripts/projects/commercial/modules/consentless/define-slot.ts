const getOptOutSlotName = (dfpSlotName: string): string => {
	if (dfpSlotName.includes('top-above-nav')) {
		return 'homepage-lead';
	}
	return 'homepage-rect';
};

const defineSlot = (slotId: string): void => {
	window.ootag.defineSlot({
		adSlot: getOptOutSlotName(slotId),
		targetId: slotId,
		filledCallback: () => {
			console.log(`filled consentless ${slotId}`);
		},
		emptyCallback: () => {
			console.log(`empty consentless ${slotId}`);
		},
	});
};

export { defineSlot };
