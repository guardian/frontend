// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// https://docs.cypress.io/guides/tooling/typescript-support#Types-for-custom-commands
declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Custom command to select DOM element by data-cy attribute.
			 * @example cy.getIframeBody('sp_message_iframe_')
			 */
			getIframeBody(selector: string): Chainable<Element>;
		}
	}
}

// Import commands.js using ES2015 syntax:
import './commands';

Cypress.on('uncaught:exception', (err, runnable) => {
	// don't break our tests if sourcepoint code breaks
	if (/wrapperMessagingWithoutDetection/.test(err.stack || '')) {
		console.warn(err);
		return false;
	}

	// When we set the `GU_U` cookie this is causing the commercial bundle to try and do
	// something with the url which is failing in Cypress with a malformed URI error
	if (err.message.includes('URI malformed')) {
		// This error is unrelated to the test in question so return  false to prevent
		// this commercial error from failing this test
		return false;
	}

	// We don't want to throw an error if the consent framework isn't loaded in the tests
	// https://github.com/guardian/consent-management-platform/blob/main/src/onConsentChange.ts#L34
	if (err.message.includes('no IAB consent framework found on the page')) {
		console.warn(err);
		return false;
	}

	return true;
});
