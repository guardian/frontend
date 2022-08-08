/* eslint-disable @typescript-eslint/no-unnecessary-condition -- ...????*/
const getOptOutSlotName = (dfpSlotName: string): string => {
	if (dfpSlotName.includes('top-above-nav')) {
		return 'homepage-lead';
	}
	return 'homepage-rect';
};

const fillAdvertSlots = (): Promise<void> => {
	// get slots
	const adverts = [...document.querySelectorAll<HTMLElement>('.js-ad-slot')];
	// define slots
	window.ootag.queue.push(() => {
		adverts.forEach((slotElement) => {
			window.ootag.defineSlot({
				adSlot: getOptOutSlotName(slotElement.id),
				targetId: slotElement.id,
				filledCallback: () => {
					console.log(`filled consentless ${slotElement.id}`);
				},
				emptyCallback: () => {
					console.log(`empty consentless ${slotElement.id}`);
				},
			});
		});
	});
	return Promise.resolve();
};

export { fillAdvertSlots };
