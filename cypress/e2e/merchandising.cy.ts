import { breakpoints } from '../fixtures/breakpoints';
import { articles } from '../fixtures/pages/articles';
import { liveblogs } from '../fixtures/pages/liveblogs';

describe('merchandising slot on pages', () => {
	[...articles, ...liveblogs].forEach(({ path, adTest }) => {
		Object.entries(breakpoints).forEach(([breakpoint, width]) => {
			it(`Test ${path} has correct slot and iframe at breakpoint ${breakpoint}`, () => {
				cy.viewport(width, 800);

				cy.visit(`${path}?adtest=${adTest}`);

				cy.allowAllConsent();

				// Check that the merchandising ad slot is on the page
				cy.get('#dfp-ad--merchandising').should('exist');

				// creative isn't loaded unless slot is in view
				cy.get('#dfp-ad--merchandising').scrollIntoView({
					duration: 4000,
				});

				// Check that an iframe is placed inside the merchandising ad slot
				cy.get('#dfp-ad--merchandising')
					.find('iframe', { timeout: 10000 })
					.should('exist');
			});
		});
	});
});
