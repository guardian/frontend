import { getStage, getTestUrl } from '../lib/util';
import { stubApiRequests } from '../lib/stubApiRequests';
import '@percy/cypress';

describe('Visually snapshot standard article', () => {
	it(`snapshots standard article`, () => {
		const path = getTestUrl(
			getStage(),
			'/politics/2022/feb/10/keir-starmer-says-stop-the-war-coalition-gives-help-to-authoritarians-like-putin',
			{ isDcr: true },
		);
		// stub all api requests
		stubApiRequests();
		// load article
		cy.visit(path);
		cy.allowAllConsent();
		// scroll to and hydrate all islands
		cy.hydrate();
		// scroll to and check all ads are rendered
		cy.checkAdsRendered();
		// snapshot
		cy.percySnapshot('article-standard', {
			widths: [320, 740, 1300],
		});
	});
});
