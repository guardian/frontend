import { allPages, fronts } from '../fixtures/pages';
import { bidderURLs, wins } from '../fixtures/prebid';

describe('GAM targeting', () => {
	const gamUrl = 'https://securepubads.g.doubleclick.net/gampad/ads?**';

	it(`checks that a request is made`, () => {
		const { path, adTest } = fronts[0];
		cy.visit(`${path}?adtest=${adTest}`);

		cy.allowAllConsent();

		cy.intercept(gamUrl).as('gamRequest');

		cy.wait('@gamRequest', { timeout: 30000 });
	});

	it(`checks the gdpr_consent param`, () => {
		const { path, adTest } = fronts[0];
		cy.visit(`${path}?adtest=${adTest}`);

		cy.allowAllConsent();

		cy.intercept({ url: gamUrl }, function (req) {
			const url = new URL(req.url);

			expect(url.searchParams.get('gdpr_consent')).to.not.be.undefined;
		}).as('gamRequest');

		cy.wait('@gamRequest', { timeout: 30000 });
	});

	fronts.forEach(({ path, section, adTest }) => {
		it(`checks custom params on the ${section} front`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			cy.allowAllConsent();

			cy.intercept({ url: gamUrl }, function (req) {
				const url = new URL(req.url);

				const custParams = decodeURIComponent(
					url.searchParams.get('cust_params') || '',
				);
				const decodedCustParams = new URLSearchParams(custParams);

				expect(decodedCustParams.get('s')).to.equal(section); // s: section
				expect(decodedCustParams.get('urlkw')).to.contain(section); // urlkw: url keywords. urlkw is an array.
				expect(decodedCustParams.get('sens')).to.equal('f'); // not sensitive content
			}).as('gamRequest');

			cy.wait('@gamRequest', { timeout: 30000 });
		});
	});

	it(`checks sensitive content is marked as sensitive`, () => {
		const sensitivePage = allPages.find(
			(page) => page?.name === 'sensitive-content',
		);
		if (!sensitivePage)
			throw new Error('No sensitive articles found to run test.');

		cy.visit(`${sensitivePage.path}?adtest=${sensitivePage.adTest}`);

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
				url: 'https://securepubads.g.doubleclick.net/gampad/ads?**',
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
		const { path } = fronts[0];

		interceptGamRequest();

		cy.visit(`${path}?adrefresh=false`);

		cy.allowAllConsent();

		cy.getIframeBody('google_ads_iframe_')
			.find('[data-cy="test-creative"]')
			.should('exist');
	});
});
