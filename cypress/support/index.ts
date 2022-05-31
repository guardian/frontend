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
		 getIframeBody(selector: string): Chainable<Element>
	  }
	}
  }


// Import commands.js using ES2015 syntax:
import './commands';
