import { defineSlot } from './define-slot';

const initFixedSlots = (): Promise<void> => {
	// get slots
	const adverts = [
		...document.querySelectorAll<HTMLElement>(
			'.js-ad-slot:not(.ad-slot--survey)',
		),
	];

	// define slots
	adverts.forEach((slotElement) => {
		const slotName = slotElement.dataset.name;
		const slotKind = slotName?.includes('inline') ? 'inline' : undefined;
		if (slotName) {
			defineSlot(slotElement, slotName, slotKind);
		}
	});

	return Promise.resolve();
};

export { initFixedSlots };
