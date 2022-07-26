import { breakpoints } from '../fixtures/breakpoints';
import { articles, liveblogs } from '../fixtures/pages';

describe('merchandising-high slot on pages', () => {
	[...articles, ...liveblogs].forEach(({ path, adTest }) => {
		Object.entries(breakpoints).forEach(([breakpoint, width]) => {
			it(`Test ${path} has correct slot and iframe at breakpoint ${breakpoint}`, () => {
				cy.viewport(width, 800)

				cy.visit(`${path}?adtest=${adTest}`);

				// Click "Yes, I'm happy" on the sourcepoint banner to obtain consent
				cy.getIframeBody('sp_message_iframe_').find('.btn-primary').click();

				// Check that the merchandising-high ad slot is on the page
				cy.get('#dfp-ad--merchandising-high').should('exist');

				// creative isn't loaded unless slot is in view
				cy.get('#dfp-ad--merchandising-high').scrollIntoView({duration: 4000});

				// Check that an iframe is placed inside the merchandising-high ad slot
				cy.get('#dfp-ad--merchandising-high')
					.find('iframe')
					.should('exist');
			});
		});
	});
});
