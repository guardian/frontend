import { articles } from '../fixtures/pages/articles';
import { liveblogs } from '../fixtures/pages/liveblogs';

describe('merchandising slot on pages', () => {
	[...articles, ...liveblogs].forEach(({ path, adTest }) => {
		it(`Test ${path} has correct slot and iframe`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			cy.allowAllConsent();

			cy.scrollTo('bottom', { duration: 5000 });

			// Check that the merchandising-high ad slot is on the page
			cy.get('#dfp-ad--merchandising-high').should('exist');

			// Check that an iframe is placed inside the merchandising-high ad slot
			cy.get('#dfp-ad--merchandising-high')
				.find('iframe')
				.should('exist');

			// Check that the merchandising ad slot is on the page
			cy.get('#dfp-ad--merchandising').should('exist');

			// Check that an iframe is placed inside the merchandising ad slot
			cy.get('#dfp-ad--merchandising').find('iframe').should('exist');
		});
	});
});
