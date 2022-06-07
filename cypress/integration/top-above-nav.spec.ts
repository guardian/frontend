import { pages } from '../fixtures/pages';

describe('top-above-nav on pages', () => {
	pages.forEach(({ path, adTest }) => {
		it(`Test ${path} has top-above-nav slot and iframe`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			// Click "Yes, I'm happy" on the sourcepoint banner to obtain consent
			cy.getIframeBody('sp_message_iframe_').find('.btn-primary').click();

			// Check that the top-above-nav ad slot is on the page
			cy.get('#dfp-ad--top-above-nav').should('exist');

			// Check that an iframe is placed inside the ad slot
			cy.get('#dfp-ad--top-above-nav').find('iframe').should('exist');
		});
	});
});
