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
		defineSlot(slotElement.id);
	});

	return Promise.resolve();
};

export { initFixedSlots };
