import type {UserFeaturesResponse} from '../../static/src/javascripts/types/membership';

/**
 * Generate a full URL for a given relative path and the desired stage
 *
 * @param {'dev' | 'code' | 'prod'} stage
 * @param {string} path
 * @param {{ isDcr?: boolean }} options
 * @returns {string} The full path
 */
export const getTestUrl = (stage: 'code' | 'prod' | 'dev', path: string, { isDcr } = { isDcr: false }) => {
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
			// The local bundle can be served from DCR by using COMMERCIAL_BUNDLE_URL when starting DCR to test changes locally without needing to launch frontend
			if (isDcr) {
				return `http://localhost:3030/Article?url=https://theguardian.com${path}`;
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


export const fakeLogin = (subscriber = true) => {
	const response: UserFeaturesResponse = {
		userId: '107421393',
		digitalSubscriptionExpiryDate: '2999-01-01',
		showSupportMessaging: false,
		contentAccess: {
			member: false,
			paidMember: false,
			recurringContributor: false,
			digitalPack: true,
			paperSubscriber: false,
			guardianWeeklySubscriber: false,
		},
	};

	if (!subscriber) {
		response.contentAccess.digitalPack = false;
		delete response.digitalSubscriptionExpiryDate;
	}

	cy.setCookie(
		'GU_U',
		'WyIzMjc5Nzk0IiwiIiwiSmFrZTkiLCIiLDE2NjA4MzM3NTEyMjcsMCwxMjEyNjgzMTQ3MDAwLHRydWVd.MC0CFQCIbpFtd0J5IqK946U1vagzLgCBkwIUUN3UOkNfNN8jwNE3scKfrcvoRSg',
	);

	cy.intercept(
		'https://members-data-api.theguardian.com/user-attributes/me',
		response,
	).as('userData');
}

 export const fakeLogOut = () => {
	// we can't just click sign out because cypress does not like following links to other domains
	cy.clearCookie('GU_U');

	cy.reload();
}
