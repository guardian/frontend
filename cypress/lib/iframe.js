/// <reference types="cypress" />

export const getIframeBody = (iframeId) => {
	// Retrieve the iframe element on the page
	const iframe = cy
		.get(`iframe#${iframeId}`, { timeout: 10_000 })
		.its('0.contentDocument')
		.should('exist');

	// Retrieve the body of the iframe and return wrapped version
	// so we can make more `cy` calls
	return iframe.its('body').should('not.be.undefined').then(cy.wrap);
};
