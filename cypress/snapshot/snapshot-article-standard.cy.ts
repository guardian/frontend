import { storage } from '@guardian/libs';
import { getStage, getTestUrl } from '../lib/util';
import { stubApiRequests } from '../lib/stubApiRequests';
import '@percy/cypress';

describe('Visually snapshot standard article', () => {
	it(`snapshots standard article`, () => {
		const path = getTestUrl(
			getStage(),
			'commentisfree/2023/feb/27/dont-believe-those-who-claim-science-proves-masks-dont-work',
			{ isDcr: true },
		);
		// stub all api requests
		stubApiRequests();
		// force geolocation to UK
		storage.local.set('gu.geo.override', 'GB');
		// load article
		cy.visit(path);
		cy.allowAllConsent();
		// scroll to and hydrate all islands
		cy.hydrate();
		// scroll to and check all ads are rendered
		cy.checkAdsRendered();
		// workaround for onwards sections
		// the intercept intermittently fails to stub the request
		cy.get('[name=OnwardsUpper]').invoke('remove');
		// snapshot
		cy.percySnapshot('article-standard', {
			widths: [320, 740, 1300],
		});
	});
});
