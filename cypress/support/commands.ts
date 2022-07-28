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

const allowAll = 'Yes, I’m happy';
const manageConsent = 'Manage my cookies';
const rejectAll = 'Reject all';

Cypress.Commands.add('rejectAllConsent', () => {
	cy.getIframeBody('sp_message_iframe_')
		.find(`button[title="${manageConsent}"]`)
		.click();

	cy.getIframeBody('iframe[title="SP Consent Message"]')
		.find(`button[title="${rejectAll}"]`, { timeout: 30000 })
		.click();
});

Cypress.Commands.add('allowAllConsent', () => {
	cy.getIframeBody('sp_message_iframe_')
		.find(`button[title="${allowAll}"]`, { timeout: 30000 })
		.click();
});
