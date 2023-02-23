import { getStage, getTestUrl } from '../lib/util';
import { stubApiRequests } from '../lib/stubApiRequests';
import '@percy/cypress';

describe('Visually snapshot long read article', () => {
	it(`snapshots long read article`, () => {
		const path = getTestUrl(
			getStage(),
			'/business/2022/apr/14/a-day-in-the-life-of-almost-every-vending-machine-in-the-world',
			{ isDcr: true },
		);
		// stub all api requests
		stubApiRequests();
		// load article
		cy.visit(path);
		cy.allowAllConsent();
		// workaround for onwards sections
		// the intercept intermittently fails to stub the request
		cy.get('[name=OnwardsUpper]').invoke('remove');
		// scroll to and hydrate all islands
		cy.hydrate();
		// scroll to and check all ads are rendered
		cy.checkAdsRendered();
		// snapshot
		cy.percySnapshot('article-long-read', {
			widths: [320, 740, 1300],
		});
	});
});
