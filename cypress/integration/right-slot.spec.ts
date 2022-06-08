import { articles, liveblogs } from '../fixtures/pages';

describe('right slot on pages', () => {
	[...articles, ...liveblogs].forEach(({ path, adTest }) => {
		it(`Test ${path} has right slot and iframe`, () => {
			// width has to be > 1300px in order for the right column to appear on liveblogs
			cy.viewport(1301, 1000);

			cy.visit(`${path}?adtest=${adTest}`);

			// Click "Yes, I'm happy" on the sourcepoint banner to obtain consent
			cy.getIframeBody('sp_message_iframe_').find('.btn-primary').click();

			// Check that the right ad slot is on the page
			cy.get('#dfp-ad--right').should('exist');

			// creative isn't loaded unless slot is in view
			cy.get('#dfp-ad--right').scrollIntoView();

			// Check that an iframe is placed inside the ad slot
			cy.get('#dfp-ad--right').find('iframe').should('exist');
		});
	});
});
