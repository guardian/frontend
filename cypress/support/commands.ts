import { articles } from '../fixtures/pages';
import { storage } from '@guardian/libs';

// ***********************************************
// For comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('getIframeBody', (selector: string) => {
	// get the iframe > document > body
	// and retry until the body element is not empty
	return (
		cy
			.get(
				selector.startsWith('iframe')
					? selector
					: `iframe[id^="${selector}"`,
			)
			.its('0.contentDocument.body')
			.should('not.be.empty')
			// wraps "body" DOM element to allow
			// chaining more Cypress commands, like ".find(...)"
			// https://on.cypress.io/wrap
			.then<HTMLElement>(cy.wrap)
	);
});

Cypress.Commands.add('findAdSlotIframeBySlotId', (adSlotId: string) => {
	cy.get(`#${adSlotId}`).find('iframe', { timeout: 30000 });
});

const allowAllButtons = ['Yes, I’m happy', 'Accept all', 'Yes, ok']
	.map((title) => `button[title="${title}"]`)
	.join(',');
const manageConsent = 'Manage my cookies';
const rejectAll = 'Reject all';

Cypress.Commands.add('rejectAllConsent', () => {
	cy.getIframeBody('sp_message_iframe_')
		.find(`button[title="${manageConsent}"]`)
		.click();

	cy.getIframeBody('iframe[title="SP Consent Message"]')
		.find(`button[title="${rejectAll}"]`, { timeout: 30000 })
		.click();
	cy.wait(100);
});

Cypress.Commands.add('allowAllConsent', () => {
	cy.getIframeBody('sp_message_iframe_')
		.find(allowAllButtons, { timeout: 30000 })
		.click();
	cy.wait(100);
});

Cypress.Commands.add('hydrate', () => {
	return cy
		.get('gu-island')
		.each((el) => {
			const deferuntil = el.attr('deferuntil');
			const name = el.attr('name');
			const defer = el.attr('deferuntil');
			const islandMeta = `island: ${name} defer: ${defer}`;
			if (['idle', 'visible', undefined].includes(deferuntil)) {
				cy.log(`Scrolling to ${islandMeta}`);
				cy.wrap(el)
					.scrollIntoView({ duration: 1000, timeout: 30000 })
					.should('have.attr', 'data-gu-ready', 'true', {
						timeout: 30000,
					});
				// Additional wait to ensure island defer=visible has triggered
				// eslint-disable-next-line cypress/no-unnecessary-waiting
				cy.wait(1000);
			} else {
				cy.log(`Skipping ${islandMeta}`);
			}
		})
		.then(() => {
			cy.scrollTo('top');
			// Additional wait to ensure layout shift has completed post hydration
			// eslint-disable-next-line cypress/no-unnecessary-waiting
			cy.wait(5000);
		});
});

Cypress.Commands.add('checkAdsRendered', () => {
	return cy
		.get('.ad-slot')
		.each((el) => {
			cy.log(`Scrolling to ad: ${el.attr('id')}`);
			cy.wrap(el)
				.scrollIntoView({ duration: 1000, timeout: 30000 })
				.should('have.class', 'ad-slot--rendered', {
					timeout: 30000,
				});
			// Additional wait to ensure visbility has triggered
			// eslint-disable-next-line cypress/no-unnecessary-waiting
			cy.wait(1000);
		})
		.then(() => {
			cy.scrollTo('top');
			// Additional wait to ensure layout shift has completed post hydration
			// eslint-disable-next-line cypress/no-unnecessary-waiting
			cy.wait(5000);
		});
});

Cypress.Commands.add('useConsentedSession', (name: string) => {
	cy.session(name, () => {
		storage.local.set('gu.geo.override', 'GB');

		cy.intercept('**/gpt.js').as('consentAll');

		cy.visit(articles[0].path);
		localStorage.setItem(
			'gu.prefs.engagementBannerLastClosedAt',
			`{"value":"${new Date().toISOString()}"}`,
		);
		cy.allowAllConsent();
		cy.wait('@consentAll', { timeout: 30000 });
	});
});
