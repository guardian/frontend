import { storage } from '@guardian/libs';

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

			findAdSlotIframeBySlotId(adSlotId: string): Chainable<Element>;

			allowAllConsent(): void;

			rejectAllConsent(): void;

			hydrate(): Chainable<JQuery<HTMLElement>>;

			useConsentedSession(name: string): void;

			checkAdsRendered(): void;
		}

		/**
		 * Include properties that we expect on the window when testing Guardian pages
		 * e.g. `window.guardian.page`
		 */
		interface ApplicationWindow extends Window {
			mockLiveUpdate: (options: {
				numNewBlocks: number;
				html: string;
				mostRecentBlockId: string;
			}) => void;
		}
	}
}

// Import commands.js using ES2015 syntax:
import './commands';

Cypress.on('uncaught:exception', (err, runnable) => false);

beforeEach(() => {
	// execute all tests in GB region for now
	storage.local.set('gu.geo.override', 'GB');
});

// Hide fetch/XHR requests
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
	const style = app.document.createElement('style');
	style.innerHTML =
		'.command-name-request, .command-name-xhr { display: none }';
	style.setAttribute('data-hide-command-log-request', '');

	app.document.head.appendChild(style);
}
