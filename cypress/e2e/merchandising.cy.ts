import { breakpoints } from '../fixtures/breakpoints';
import { articles, liveblogs } from '../fixtures/pages';
import { mockIntersectionObserver } from '../lib/util';

describe('merchandising slot on pages', () => {
	beforeEach(() => {
		cy.useConsentedSession('merchandising-consented');
	});
	[...articles, ...liveblogs].forEach(({ path }) => {
		breakpoints.forEach(({ breakpoint, width, height }) => {
			it(`Test ${path} has correct slot and iframe at breakpoint ${breakpoint}`, () => {
				cy.viewport(width, height);

				cy.visit(path, {
					onBeforeLoad(win) {
						mockIntersectionObserver(win, '#dfp-ad--merchandising');
					},
				});

				cy.get('#dfp-ad--merchandising')
					.scrollIntoView({ duration: 200 })
					.should('exist');

				// Check that an iframe is placed inside the merchandising ad slot
				cy.findAdSlotIframeBySlotId('dfp-ad--merchandising').should(
					'exist',
				);
			});
		});
	});
});
