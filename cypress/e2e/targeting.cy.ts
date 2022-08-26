import { allPages, articles } from '../fixtures/pages';
import { bidderURLs, wins } from '../fixtures/prebid';

const gamUrl = 'https://securepubads.g.doubleclick.net/gampad/ads?**';

describe('GAM targeting', () => {
	it(`checks that a request is made`, () => {
		const { path } = articles[0];
		cy.visit(path);

		cy.allowAllConsent();

		cy.intercept(gamUrl).as('gamRequest');

		cy.wait('@gamRequest', { timeout: 30000 });
	});

	it(`checks the gdpr_consent param`, () => {
		const { path } = articles[0];
		cy.visit(path);

		cy.allowAllConsent();

		cy.intercept({ url: gamUrl }, function (req) {
			const url = new URL(req.url);

			expect(url.searchParams.get('gdpr_consent')).to.not.be.undefined;
		}).as('gamRequest');

		cy.wait('@gamRequest', { timeout: 30000 });
	});

	it(`checks sensitive content is marked as sensitive`, () => {
		const sensitivePage = allPages.find(
			(page) => page?.name === 'sensitive-content',
		);
		if (!sensitivePage)
			throw new Error('No sensitive articles found to run test.');

		cy.visit(sensitivePage.path);

		cy.allowAllConsent();

		cy.intercept({ url: gamUrl }, function (req) {
			const url = new URL(req.url);

			const custParams = decodeURIComponent(
				url.searchParams.get('cust_params') || '',
			);
			const decodedCustParams = new URLSearchParams(custParams);

			expect(decodedCustParams.get('sens')).to.equal('t');
		}).as('gamRequest');

		cy.wait('@gamRequest', { timeout: 30000 });
	});
});

describe('Prebid targeting', () => {
	const interceptGamRequest = () =>
		cy.intercept(
			{
				url: gamUrl,
			},
			function (req) {
				const url = new URL(req.url);

				const targetingParams = decodeURIComponent(
					url.searchParams.get('prev_scp') || '',
				);
				const targeting = new URLSearchParams(targetingParams);
				if (targeting.get('hb_bidder') === 'criteo') {
					Object.entries(wins.criteo.targeting).forEach(
						([key, value]) => {
							expect(targeting.get(key)).to.equal(value);
						},
					);
				}
			},
		);

	before(() => {
		bidderURLs.forEach((url) => {
			cy.intercept(url, (req) => {
				if (req.url.includes(wins.criteo.url)) {
					req.reply({ body: wins.criteo.response });
				} else {
					req.reply({
						statusCode: 204,
					});
				}
			});
		});
	});

	it(`prebid winner should display ad and send targeting to GAM`, () => {
		const { path } = articles[0];

		interceptGamRequest();

		const url = new URL(path);
		url.searchParams.set('adrefresh', 'false');
		url.searchParams.delete('adtest');
		cy.visit(url.toString());

		cy.allowAllConsent();

		cy.getIframeBody('google_ads_iframe_')
			.find('[data-cy="test-creative"]')
			.should('exist');
	});
});
