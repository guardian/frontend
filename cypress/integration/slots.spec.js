/// <reference types="cypress" />

import { getStage, getTestUrl } from '../lib/util';

// Don't fail tests when uncaught exceptions occur
// This is because scripts loaded on the page and unrelated to these tests can cause this
Cypress.on('uncaught:exception', (err, runnable) => {
	return false;
});

const stage = getStage();

const pages = [
	{
		path: getTestUrl(
			stage,
			'/environment/2020/oct/13/maverick-rewilders-endangered-species-extinction-conservation-uk-wildlife',
			{ isDcr: true },
		),
		expectedMinTotalSlotsOnPage: 14,
		expectedMinInlineSlotsOnPage: 10,
		adTest: 'fixed-puppies',
	},
];

describe('Slots and iframes load on pages', () => {
	pages.forEach(
		({
			path,
			adTest,
			expectedMinTotalSlotsOnPage,
			expectedMinInlineSlotsOnPage,
		}) => {
			it(`Test ${path} has at least ${expectedMinInlineSlotsOnPage} inline and ${expectedMinTotalSlotsOnPage} total slots`, () => {
				cy.visit(`${path}?adtest=${adTest}`);

				// Click "Yes, I'm happy" on the sourcepoint banner to obtain consent
				cy.getIframeBody('sp_message_iframe_597005')
					.find('.btn-primary')
					.click();

				cy.scrollTo('bottom', { duration: 5000 });

				// We are excluding survey slot as it only appears via cypress tests and only on frontend.
				// Also, we are waiting *up to* 30 seconds here to give the ads time to load. In most
				// cases this check will pass much faster
				cy.get('.js-ad-slot:not([data-name="survey"]', {
					timeout: 30_000,
				}).should(
					'have.length.of.at.least',
					expectedMinTotalSlotsOnPage,
				);

				Array(expectedMinInlineSlotsOnPage)
					.fill()
					.forEach((item, i) => {
						cy.get(`[data-name="inline${i + 1}"]`).should(
							'have.length',
							1,
						);
					});

				cy.get(`[data-name="right"]`).should('have.length', 1);

				cy.get(`[data-name="merchandising-high"]`).should(
					'have.length',
					1,
				);
				cy.get(`[data-name="mostpop"]`).should('have.length', 1);
				cy.get(`[data-name="merchandising"]`).should('have.length', 1);
			});
		},
	);
});
