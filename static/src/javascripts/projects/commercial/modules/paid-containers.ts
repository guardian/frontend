import fastdom from 'fastdom';
import { $$ } from '../../../lib/$$';

const onKeyPress = (handler: EventListener) => (event: KeyboardEvent) => {
	if (event.code === 'Enter' || event.code === 'Space') {
		handler(event);
	}
};

const onOpenClick = (event: Event) => {
	const summary = event.currentTarget as HTMLElement;
	const details = summary.parentElement;
	const label = $$('.js-button__label', summary).get(0);
	const textContent = summary.getAttribute('data-text');
	if (details?.hasAttribute('open')) {
		fastdom.mutate(() => {
			label.textContent = `More ${textContent ?? ''}`;
		});
	} else {
		fastdom.mutate(() => {
			label.textContent = 'Less';
		});
	}
};

/**
 * Initialise Guardian Labs paid content container a.k.a Dumathoin
 * @returns Promise
 */
const paidContainers = (): Promise<void> => {
	// TODO is this relevant? add amIUsed
	const showMores = $$('.dumathoin-more > summary').get();
	showMores.forEach((el) => el.addEventListener('click', onOpenClick));
	showMores.forEach((el) =>
		el.addEventListener('keydown', (e) => onKeyPress(onOpenClick)(e)),
	);

	return Promise.resolve();
};

export { paidContainers };
