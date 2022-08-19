import { setCookie } from '@guardian/libs';
import { $$ } from '../../../../lib/$$';

const toggle = (e: HTMLElement): void => {
	e.style.display = e.style.display === 'none' ? '' : 'none';
};

export const init = (): void => {
	const containers = $$('.fc-aus-territory__container');
	containers.get().forEach((container) => {
		const body = $$('.fc-aus-territory__body', container);
		const accordionButtons = $$(
			'.fc-aus-territory__accordion-header',
			container,
		);
		const accordionArrows = $$(
			'.fc-aus-territory__accordion-arrow',
			container,
		);
		accordionButtons.get().forEach((button) => {
			button.addEventListener('click', () => {
				const isOpen = button.getAttribute('aria-expanded');
				button.setAttribute(
					'aria-expanded',
					isOpen === 'true' ? 'false' : 'true',
				);
				accordionArrows.get().forEach(toggle);
				body.get().forEach(toggle);
			});
		});

		const territoryButtons = $$(
			'.fc-aus-territory__territory-button',
			container,
		).get();
		territoryButtons.forEach((button) => {
			button.addEventListener('click', () => {
				const attrValue = button.getAttribute('data-link-name');
				if (attrValue) {
					// Fastly expects the value of 'Other' - if a different, non-valid value is provided,
					// fastly will ignore the cookie & use the users locations
					const value =
						attrValue === 'AU-hide-thrasher' ? 'Other' : attrValue;
					setCookie({ name: 'GU_territory', value });
					location.reload();
				}
			});
		});
	});
};
