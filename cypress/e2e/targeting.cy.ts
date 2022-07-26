import { pages } from '../fixtures/pages';

const interceptGamRequest = () => {
	return cy.intercept(
		{
			url: 'https://securepubads.g.doubleclick.net/gampad/ads?**',
		},
		function (req) {
			const url = new URL(req.url);

			expect(url.searchParams.get('gdpr_consent')).to.not.be.undefined;

			const custParams = decodeURIComponent(
				url.searchParams.get('cust_params') || '',
			);
			const decodedCustParams = new URLSearchParams(custParams);
			expect(decodedCustParams.get('consent_tcfv2')).to.equal('t');
		},
	);
};

describe('targeting', () => {
	it(`intercepts GAM request`, () => {
		const { path, adTest } = pages[0];

		cy.visit(`${path}?adtest=${adTest}`);

		// Click "Yes, I'm happy" on the sourcepoint banner to obtain consent
		cy.getIframeBody('sp_message_iframe_').find('.btn-primary').click();

		// Check that the top-above-nav ad slot is on the page
		cy.get('#dfp-ad--top-above-nav').should('exist');

		interceptGamRequest().as('gamRequest');

		cy.wait('@gamRequest', { timeout: 30000 });
	});
});
