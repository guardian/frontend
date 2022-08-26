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
		const slotName = slotElement.dataset.name?.includes('inline')
			? 'inline'
			: slotElement.dataset.name;
		if (slotName) {
			defineSlot(slotElement.id, slotName);
		}
	});

	return Promise.resolve();
};

export { initFixedSlots };
