import { articles } from '../fixtures/pages';
import { mostReadGeo } from '../fixtures/api/most-read-geo';
import '@percy/cypress';

const stubApiRequest = (url: string, response: object) => cy.intercept(
	url,
	(req) => req.reply({ body: response }),
);

describe('Visually snapshot standard article', () => {
	[articles[0]].forEach(({ path }) => {
		it(`snapshots ${path}`, () => {
			cy.visit(path);
			cy.allowAllConsent();
			// check we have top-above-nav
			cy.get('#dfp-ad--top-above-nav').should('exist');
			cy.findAdSlotIframeBySlotId('dfp-ad--top-above-nav').should(
				'exist',
			);
			// stub most viewed right
			stubApiRequest('https://api.nextgen.guardianapps.co.uk/most-read-geo.json?dcr=true', mostReadGeo);
			// hydrate all islands
			cy.hydrate();
			// snapshot
			cy.percySnapshot('top-above-nav', {
				widths: [740, 1300],
			});
		});
	});
});
