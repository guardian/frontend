import { breakpoints } from '../fixtures/breakpoints';
import { articles, liveblogs } from '../fixtures/pages';

describe('merchandising slot on pages', () => {
	[...articles, ...liveblogs].forEach(({ path, adTest }) => {
		breakpoints.forEach(({ breakpoint, width }) => {
			it(`Test ${path} has correct slot and iframe at breakpoint ${breakpoint}`, () => {
				cy.viewport(width, 800);

				cy.visit(path);

				cy.allowAllConsent();

				// Check that the merchandising ad slot is on the page
				cy.get('#dfp-ad--merchandising').should('exist');

				// Ensure all lazy loaded items are loaded
				cy.scrollTo('bottom', { duration: 3000 });

				// creative isn't loaded unless slot is in view
				cy.get('#dfp-ad--merchandising').scrollIntoView({
					duration: 3000,
				});

				// Check that an iframe is placed inside the merchandising ad slot
				cy.findAdSlotIframeBySlotId('dfp-ad--merchandising').should(
					'exist',
				);
			});
		});
	});
});
