import { setCookie } from '@guardian/libs'
import $ from 'lib/$';

export const init = (): void => {
	const containers = $('.fc-aus-territory__container');
	containers.each((container: HTMLElement) => {
		const body = $('.fc-aus-territory__body', container)
		const accordionButtons = $('.fc-aus-territory__accordion-header', container)
		const accordionArrows = $('.fc-aus-territory__accordion-arrow', container)
		accordionButtons.each((button: HTMLElement) => {
			button.addEventListener('click', () => {
				accordionArrows.toggle();
				body.toggle();
			})
		})

		const territoryButtons = $('.fc-aus-territory__territory-button', container);
		territoryButtons.each((button: HTMLElement) => {
			button.addEventListener('click', () => {
				const attrValue = button.getAttribute('data-link-name');
				if (attrValue) {
					// Fastly expects the value of 'Other' - if a different, non-valid value is provided,
					// fastly will ignore the cookie & use the users locations
					const value = attrValue === 'AU-other' ? 'Other' : attrValue
					setCookie({name: 'GU_territory', value });
					location.reload();
				}
			})
		})
	})
}
