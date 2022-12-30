import { articles } from '../fixtures/pages';
import { mostReadGeo } from '../fixtures/api/most-read-geo';
import { mostRead } from '../fixtures/api/most-read';
import { regularStories } from '../fixtures/api/regular-stories';
import '@percy/cypress';

const stubApiRequest = (url: string, response: object) =>
	cy.intercept(url, (req) => req.reply({ body: response }));

const stubApiRequests = () => {
	// stub most viewed right
	stubApiRequest(
		'https://api.nextgen.guardianapps.co.uk/most-read-geo.json?dcr=true',
		mostReadGeo,
	);
	// stub headlines
	stubApiRequest(
		'https://api.nextgen.guardianapps.co.uk/container/data/uk-alpha/news/regular-stories.json',
		regularStories,
	);
	// stub most viewed bottom
	stubApiRequest(
		'https://api.nextgen.guardianapps.co.uk/most-read/politics.json?dcr=true',
		mostRead,
	);
};

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
				widths: [740, 1300],
			});
		});
	});
});
