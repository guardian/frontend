import { articles } from '../fixtures/pages/articles';
import { liveblogs } from '../fixtures/pages/liveblogs';

describe('mostpop slot on pages', () => {
	[...articles, ...liveblogs].forEach(({ path, adTest }) => {
		it(`Test ${path} has correct slot and iframe`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			cy.allowAllConsent();

			// Check that the mostpop ad slot is on the page
			cy.get('#dfp-ad--mostpop').should('exist');

			// creative isn't loaded unless slot is in view
			cy.get('#dfp-ad--mostpop').scrollIntoView();

			// Check that an iframe is placed inside the ad slot
			cy.get('#dfp-ad--mostpop').find('iframe').should('exist');
		});
	});
});
