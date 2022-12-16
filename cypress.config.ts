import { defineConfig } from 'cypress';

export default defineConfig({
	projectId: 'commercial-e2e',
	chromeWebSecurity: false,
	defaultCommandTimeout: 15000,
	retries: {
		runMode: 2,
		openMode: 0,
	},
	video: false,
	e2e: {
		setupNodeEvents(on, config) {
			return require('./cypress/plugins/index.ts').default(on, config);
		},
	},
	// Test files like merchandising.cy.ts that take a few minutes to run exceed the memory limit
	// causing the browser to crash. Since we're not using snapshots at the moment, work around the
	// issue by not saving tests to memory. https://github.com/cypress-io/cypress/issues/1906
	numTestsKeptInMemory: 0,
});
