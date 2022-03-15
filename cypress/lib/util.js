/// <reference types="cypress" />

/**
 * Generate a full URL for a given relative path and the desired stage
 *
 * @param {'dev' | 'code' | 'prod'} stage
 * @param {string} path
 * @param {{ isDcr?: boolean }} options
 * @returns {string} The full path
 */
export const getTestUrl = (stage, path, { isDcr } = { isDcr: false }) => {
	switch (stage) {
		case 'code': {
			return `https://code.dev-theguardian.com${path}`;
		}
		case 'prod': {
			return `https://theguardian.com${path}`;
		}
		// Use dev if no stage properly specified
		case 'dev':
		default: {
			// TODO We currently have two separate URLs for testing DCR locally
			// Investigate why proxying URLs via 9000 doesn't work
			if (isDcr) {
				return `http://localhost:3030/Article?url=${path}`;
			} else {
				return `http://localhost:9000${path}`;
			}
		}
	}
};

/**
 * Pass different stage in via environment variable
 * e.g. `yarn cypress run --env stage=code`
 */
export const getStage = () => {
	const stage = Cypress.env('stage');
	return stage?.toLowerCase();
};
