import { articles } from '../fixtures/pages';
import '@percy/cypress';

describe('Visually snapshot standard article', () => {
	[articles[0]].forEach(({ path }) => {
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
