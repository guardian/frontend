import { defineSlot } from './define-slot';

const initFixedSlots = (): Promise<void> => {
	// get slots
	const adverts = [...document.querySelectorAll<HTMLElement>('.js-ad-slot')];
	// define slots
	window.ootag.queue.push(() => {
		adverts.forEach((slotElement) => {
			
		});
	});
	return Promise.resolve();
};

export { initFixedSlots };
