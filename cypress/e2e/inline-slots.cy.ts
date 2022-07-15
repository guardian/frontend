import { pages } from '../fixtures/pages';

describe('Slots and iframes load on pages', () => {
	const testPages = pages.filter(
		(page) => 'expectedMinInlineSlotsOnPage' in page,
	);

	testPages.forEach(({ path, adTest, expectedMinInlineSlotsOnPage }) => {
		it(`Test ${path} has at least ${expectedMinInlineSlotsOnPage} inline total slots`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			cy.allowAllConsent();

			cy.scrollTo('bottom', { duration: 5000 });

			[...Array(expectedMinInlineSlotsOnPage).keys()].forEach((_, i) => {
				cy.get(`[data-name="inline${i + 1}"]`).should('have.length', 1);
			});
		});
	});
});
