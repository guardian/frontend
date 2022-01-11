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

/**
 * Initialise Redplanet, pre and post campaign analysis
 * https://docs.google.com/presentation/d/1B8eg9GP5CUMTH9lkjtmkcExq32tx97nngXB0wOBoweI/edit#slide=id.g51461c3927_0_83
 */
export const init = () => {
	if (commercialFeatures.launchpad && isInAuOrNz()) {
		return setupRedplanet();
	}
	return Promise.resolve();
};

export const resetModule = () => {
	initialised = false;
};
