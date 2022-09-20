import { allPages } from '../fixtures/pages';

describe('top-above-nav on pages', () => {
	allPages.forEach(({ path }) => {
		it(`Test ${path} has top-above-nav slot and iframe`, () => {
			cy.visit(path);

			cy.allowAllConsent();

			cy.window().then((window) => {
				const { isImmersive } = window.guardian.config.page;
				if (!isImmersive) {
					// Check that the top-above-nav ad slot is on the page
					cy.get('#dfp-ad--top-above-nav').should('exist');

					// Check that an iframe is placed inside the ad slot
					cy.findAdSlotIframeBySlotId('dfp-ad--top-above-nav').should(
						'exist',
					);
				} else {
					// Check that the top-above-nav ad slot is not on the page
					cy.get('#dfp-ad--top-above-nav').should('not.exist');
				}
			});
		});
	});
});
