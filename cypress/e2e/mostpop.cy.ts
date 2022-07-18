import { breakpoints } from '../fixtures/breakpoints';
import { articles, liveblogs } from '../fixtures/pages';

describe('mostpop slot on pages', () => {
	[...articles, ...liveblogs].forEach(({ path, adTest }) => {
		Object.entries(breakpoints).forEach(([breakpoint, width]) => {
			it(`Test ${path} has correct slot and iframe at breakpoint ${breakpoint}`, () => {
				cy.visit(`${path}?adtest=${adTest}`);

				cy.allowAllConsent();

				// Check that the mostpop ad slot is on the page
				cy.get('#dfp-ad--mostpop').should('exist');

				// creative isn't loaded unless slot is in view
				cy.get('#dfp-ad--mostpop').scrollIntoView();

				// Check that an iframe is placed inside the ad slot
				cy.findAdSlotIframeBySlotId('dfp-ad--mostpop').should('exist');
			});
		});
	});
});
