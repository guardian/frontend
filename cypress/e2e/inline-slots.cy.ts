import { breakpoints } from '../fixtures/breakpoints';
import { articles, liveblogs } from '../fixtures/pages';

const pages = [...articles, ...liveblogs].filter(
	(page) => 'expectedMinInlineSlotsOnPage' in page,
);

describe('Slots and iframes load on pages', () => {
	pages.forEach(({ path, expectedMinInlineSlotsOnPage }) => {
		breakpoints.forEach(({ breakpoint, width }) => {
			it(`Test ${path} has at least ${expectedMinInlineSlotsOnPage} inline total slots at breakpoint ${breakpoint}`, () => {
				cy.viewport(width, 500);

				cy.visit(path);

				cy.allowAllConsent();

				cy.scrollTo('bottom', { duration: 5000 });

				[...Array(expectedMinInlineSlotsOnPage).keys()].forEach(
					(item, i) => {
						cy.get(`[data-name="inline${i + 1}"]`).should(
							'have.length',
							1,
						);
					},
				);
			});
		});
	});
});
