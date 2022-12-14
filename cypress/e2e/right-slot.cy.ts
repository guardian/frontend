import { breakpoints } from '@guardian/source-foundations';
import { articles, liveblogs } from '../fixtures/pages';

describe('right slot on pages', () => {
	beforeEach(() => {
		cy.useConsentedSession('right-consented');
	});
	[...articles, ...liveblogs].forEach(({ path }) => {
		it(`Test ${path} has correct slot and iframe`, () => {
			// viewport width has to be >= 1300px in order for the right column to appear on liveblogs
			cy.viewport(breakpoints['wide'], 1000);

			cy.visit(path);

			// Check that the right ad slot is on the page
			cy.get('#dfp-ad--right').should('exist');

			// creative isn't loaded unless slot is in view
			cy.get('#dfp-ad--right').scrollIntoView();

			// Check that an iframe is placed inside the ad slot
			cy.findAdSlotIframeBySlotId('dfp-ad--right').should('exist');
		});
	});
});
