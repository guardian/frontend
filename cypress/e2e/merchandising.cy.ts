import { articles, liveblogs } from '../fixtures/pages';

describe('merchandising slot on pages', () => {
	[...articles, ...liveblogs].forEach(({ path, adTest }) => {
		it(`Test ${path} has correct slot and iframe`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			// Click "Yes, I'm happy" on the sourcepoint banner to obtain consent
			cy.getIframeBody('sp_message_iframe_').find('.btn-primary').click();

			// Check that the merchandising-high ad slot is on the page
			cy.get('#dfp-ad--merchandising-high').should('exist');

			// creative isn't loaded unless slot is in view
			cy.get('#dfp-ad--merchandising-high').scrollIntoView();

			// Check that an iframe is placed inside the merchandising-high ad slot
			cy.get('#dfp-ad--merchandising-high')
				.find('iframe')
				.should('exist');

			// Check that the merchandising ad slot is on the page
			cy.get('#dfp-ad--merchandising').should('exist');

			// creative isn't loaded unless slot is in view
			cy.get('#dfp-ad--merchandising').scrollIntoView();

			// Check that an iframe is placed inside the merchandising ad slot
			cy.get('#dfp-ad--merchandising').find('iframe').should('exist');
		});
	});
});
