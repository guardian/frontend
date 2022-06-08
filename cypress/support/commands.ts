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
			.get(`iframe[id^="${selector}"`)
			.its('0.contentDocument.body')
			.should('not.be.empty')
			// wraps "body" DOM element to allow
			// chaining more Cypress commands, like ".find(...)"
			// https://on.cypress.io/wrap
			.then<HTMLElement>(cy.wrap)
	);
});
