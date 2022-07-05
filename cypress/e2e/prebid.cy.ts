import { pages } from '../fixtures/pages';

const prebidURLs = [
	'https://ib.adnxs.com/ut/v3/prebid',
	'https://htlb.casalemedia.com/cygnus**',
	'https://hbopenbid.pubmatic.com/translator?source=prebid-client',
	'https://prg.smartadserver.com/prebid/v1',
	'https://rtb.openx.net/sync/prebid**',
	'https://elb.the-ozone-project.com/openrtb2/auction',
	'https://bidder.criteo.com/cdb**',
	'https://pixel.adsafeprotected.com/services/pub**',
	'https://ad.360yield.com/pb',
];


describe('targeting', () => {
	before(() => {
		prebidURLs.forEach(url => {
			cy.intercept(url, (req) => {
				if(req.url.includes('https://bidder.criteo.com/cdb')) {
					const body = JSON.parse(req.body);
					body.slots[0].impid = 'banner-ad-div';
					body.slots[0].sizes = ['300x250', '728x90'];
					body.publisher.networkid = 497747;

					req.body = JSON.stringify(body);

					req.continue();
				} else {

				req.reply({
					delay: 2500,
					body: ''
				  })
				}
			});
		});
	});

	it(`intercepts prebid requests`, () => {
		const { path, adTest } = pages[0];

		// cy.visit(`${path}?adtest=${adTest}&pbjs_debug=true`);
		cy.visit(`${path}?pbjs_debug=true`);

		cy.window().then((win) => {
			win.guardian.logger.subscribeTo('commercial');
		});

		// Click "Yes, I'm happy" on the sourcepoint banner to obtain consent
		cy.getIframeBody('sp_message_iframe_').find('.btn-primary').click();

		// Check that the top-above-nav ad slot is on the page
		cy.get('#dfp-ad--top-above-nav').should('exist');

		cy.wait(30000)
	});
});
