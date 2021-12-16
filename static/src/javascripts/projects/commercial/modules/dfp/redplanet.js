import { getConsentFor } from '@guardian/consent-management-platform';
import { log } from '@guardian/libs';
import { getInitialConsentState } from 'commercial/initialConsentState';
import config from '../../../../lib/config';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { isInAuOrNz } from '../../../common/modules/commercial/geo-utils';

let initialised = false;

const initialise = () => {
	// Initialise Launchpad Tracker
	window.launchpad('newTracker', 'launchpad', 'lpx.qantas.com', {
		discoverRootDomain: true,
		appId: 'the-guardian',
	});

	// Track Page Views
	window.launchpad('trackUnstructEvent', {
		schema: 'iglu:com.qantas.launchpad/hierarchy/jsonschema/1-0-0',
		data: {
			u1: 'theguardian.com',
			u2: config.get('page.section'),
			u3: config.get('page.sectionName'),
			u4: config.get('page.contentType'),
			uid: config.get('ophan', {}).browserId,
		},
	});
};

const setupRedplanet = () =>
	getInitialConsentState()
		.then((state) => {
			if (!getConsentFor('redplanet', state)) {
				return Promise.reject('No consent for redplanet');
			}

			if (!state.aus) {
				return Promise.reject(
					'Redplanet should only run in Australia on AUS mode',
				);
			}

			if (!initialised) {
				initialised = true;
				return import(
					/* webpackChunkName: "redplanet" */ '../../../../lib/launchpad.js'
				);
			}
		})
		.then(() => {
			initialise();
		})
		.catch((e) => {
			log('commercial', '⚠️ Failed to execute redplanet', e);
		});

export const init = () => {
	if (commercialFeatures.launchpad && isInAuOrNz()) {
		return setupRedplanet();
	}
	return Promise.resolve();
};

export const resetModule = () => {
	initialised = false;
};
