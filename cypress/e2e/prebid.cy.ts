import { pages } from '../fixtures/pages';
import { bidderURLs, wins } from '../fixtures/prebid';

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

describe('targeting', () => {
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
		const { path } = pages[0];

		interseptGamRequest();

		cy.visit(`${path}?adrefresh=false`);

		// Click "Yes, I'm happy" on the sourcepoint banner to obtain consent
		cy.getIframeBody('sp_message_iframe_').find('.btn-primary').click();

		cy.getIframeBody('google_ads_iframe_')
			.find('[data-cy="test-creative"]')
			.should('exist');
	});
});
