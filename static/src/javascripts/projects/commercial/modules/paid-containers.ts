import bean from 'bean';
import fastdom from 'fastdom';
import { $$ } from '../../../lib/$$';

const onKeyPress = (handler: EventListener) => (event: KeyboardEvent) => {
	if (event.keyCode === 0x20 || event.keyCode === 0x0d) {
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

const paidContainers = (): Promise<void> => {
	const showMores = $$('.dumathoin-more > summary').get();
	bean.on(document, 'click', showMores, onOpenClick);
	bean.on(document, 'click', showMores, onKeyPress(onOpenClick));

	return Promise.resolve();
};

export { paidContainers };
