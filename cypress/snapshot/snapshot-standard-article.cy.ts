import { articles } from '../fixtures/pages';
import { stubApiRequests } from '../lib/stubApiRequests';
import '@percy/cypress';

describe('Visually snapshot standard article', () => {
	[articles[0]].forEach(({ path }) => {
		it(`snapshots ${path}`, () => {
			// stub all api requests
			stubApiRequests();
			// load article
			cy.visit(path);
			cy.allowAllConsent();
			// check we have top-above-nav
			cy.get('#dfp-ad--top-above-nav').should('exist');
			cy.findAdSlotIframeBySlotId('dfp-ad--top-above-nav').should(
				'exist',
			);
			// scroll to and hydrate all islands
			cy.hydrate();
			// snapshot
			cy.percySnapshot('top-above-nav', {
				widths: [320, 740, 1300],
			});
		});
	});
});
