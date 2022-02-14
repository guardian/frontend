/// <reference types="cypress" />

import { getTestUrl } from '../lib/url';
import { getIframeBody } from '../lib/iframe';

// Don't fail tests when uncaught exceptions occur
// This is because scripts loaded on the page and unrelated to these tests can cause this
Cypress.on('uncaught:exception', (err, runnable) => {
	return false;
});

// Pass different stage in via environment variable
// e.g. `yarn cypress run --env stage=code`
const stage = Cypress.env('stage');

const pages = [
	{
		path: getTestUrl(stage, ''),
		adTest: 'fixed-puppies',
	},
	{
		path: getTestUrl(
			stage,
			'/politics/2022/feb/10/keir-starmer-says-stop-the-war-coalition-gives-help-to-authoritarians-like-putin',
			{ isDcr: true },
		),
		adTest: 'fixed-puppies',
	},
	{
		path: getTestUrl(
			stage,
			'/politics/live/2022/jan/31/uk-politics-live-omicron-nhs-workers-coronavirus-vaccines-no-10-sue-gray-report',
			{ isDcr: false },
		),
		adTest: 'fixed-puppies',
	},
	{
		path: getTestUrl(
			stage,
			'/sport/2022/feb/10/team-gb-winter-olympic-struggles-go-on-with-problems-for-skeleton-crew',
			{ isDcr: true },
		),
		adTest: 'fixed-puppies',
	},
];

describe('top-above-nav on pages', () => {
	pages.forEach(({ path, adTest }) => {
		it(`Test ${path} has top-above-nav slot and iframe`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			// Click "Yes, I'm happy" on the sourcepoint banner to obtain consent
			getIframeBody('sp_message_iframe_597005')
				.find('.btn-primary', { timeout: 10_000 })
				.click();

			// Check that the top-above-nav ad slot is on the page
			cy.get('#dfp-ad--top-above-nav').should('exist');

			// Check that an iframe is placed inside the ad slot
			cy.get('#dfp-ad--top-above-nav')
				.find('iframe', { timeout: 10_000 })
				.should('exist');
		});
	});
});
