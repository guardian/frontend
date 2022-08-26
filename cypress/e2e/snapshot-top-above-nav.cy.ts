import { articles, liveblogs } from '../fixtures/pages';
import { breakpoints } from '../fixtures/breakpoints';
import '@percy/cypress';

describe('Visually snapshot top-above-nav', () => {
	[articles[0]].forEach(({ path, adTest }) => {
		it(`snapshots ${path}`, () => {
			cy.visit(path);
			cy.allowAllConsent();
			cy.get('#dfp-ad--top-above-nav').should('exist');
			cy.findAdSlotIframeBySlotId('dfp-ad--top-above-nav').should(
				'exist',
			);
			cy.hydrate();
			cy.percySnapshot('top-above-nav', {
				// TODO decide on the breakpoints we wish to snapshot
				// widths: breakpoints.map(b => b.width),
				widths: [740, 1300],
			});
		});
	});
});
