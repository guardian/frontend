import {
	getConsentFor,
	onConsentChange,
} from '@guardian/consent-management-platform';
import { log } from '@guardian/libs';
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

const setupRedplanet = async () => {
	let resolveRedPlanetLoaded;
	let rejectRedPlanetLoaded;
	const promise = new Promise((resolve, reject) => {
		resolveRedPlanetLoaded = resolve;
		rejectRedPlanetLoaded = reject;
	}).catch((e) => {
		log('commercial', '⚠️ Failed to execute redplanet', e);
	});

	onConsentChange((state) => {
		if (!getConsentFor('redplanet', state)) {
			rejectRedPlanetLoaded('No consent for redplanet');
			return;
		}

		if (!state.aus) {
			rejectRedPlanetLoaded('Redplanet should only run in Australia on AUS mode');
			return;
		}

        if (!initialised) {
            initialised = true;
            import(/* webpackChunkName: "redplanet" */ '../../../../lib/launchpad.js').then(() => {
                initialise();
                resolveRedPlanetLoaded();
            });
        }
	});

	return promise;
};

export const init = () => {
	if (commercialFeatures.launchpad && isInAuOrNz()) {
		return setupRedplanet();
	}
	return Promise.resolve();
};

export const resetModule = () => {
	initialised = false;
};
