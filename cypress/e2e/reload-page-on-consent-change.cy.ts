import { articles } from '../fixtures/pages';

const path = articles[0].path;

describe('Reload page on consent change', () => {
	it(`Test ${path} change from accept all to reject all`, () => {
		cy.visit(path);

		cy.intercept(path).as('reload')

		// allow all consents from the privacy banner
		cy.allowAllConsent();

		// then reject all from the privacy manager
		cy.privacyManagerRejectAllConsent();

		// assert the page has reloaded
		cy.wait('@reload').its('response.statusCode').should('eq', 200)

	});
});
