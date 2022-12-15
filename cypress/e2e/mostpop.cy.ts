import { breakpoints } from '../fixtures/breakpoints';
import { articles, liveblogs } from '../fixtures/pages';
import { mockIntersectionObserver } from '../lib/util';

describe('mostpop slot on pages', () => {
	beforeEach(() => {
		cy.useConsentedSession('mostpop-consented');
	});
	[...articles, ...liveblogs].forEach(({ path }) => {
		breakpoints.forEach(({ breakpoint, width, height }) => {
			it(`Test ${path} has correct slot and iframe at breakpoint ${breakpoint}`, () => {
				cy.viewport(width, height);

				cy.visit(path, {
					onBeforeLoad(win) {
						mockIntersectionObserver(win, '#dfp-ad--mostpop');
					},
				});

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
