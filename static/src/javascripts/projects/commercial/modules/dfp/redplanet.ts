import {
	getConsentFor,
	onConsent,
} from '@guardian/consent-management-platform';
import { log } from '@guardian/libs';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { isInAuOrNz } from '../../../common/modules/commercial/geo-utils';

declare global {
	interface Window {
		launchpad?: (...args: unknown[]) => void;
	}
}

let initialised = false;

const initialise = () => {
	if (!window.launchpad) return;

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
			u2: window.guardian.config.page.section,
			u3: window.guardian.config.page.sectionName,
			u4: window.guardian.config.page.contentType,
			uid: window.guardian.config.ophan.browserId ?? '',
		},
	});
};

const setupRedplanet = () =>
	onConsent()
		.then((state) => {
			if (!state.aus) {
				return Promise.reject(
					'Redplanet should only run in Australia on AUS mode',
				);
			}

			if (!getConsentFor('redplanet', state)) {
				return Promise.reject('No consent for redplanet');
			}
		})
		.then(() => {
			if (initialised)
				return Promise.reject('replanet already initialised');

			initialised = true;
			return import(
				/* webpackChunkName: "redplanet" */
				// @ts-expect-error -- we’re loading a third-party JS file
				'../../../../lib/launchpad.js'
			);
		})
		.then(() => {
			initialise();
		})
		.catch((reason) => {
			log('commercial', '⚠️ Failed to execute redplanet', reason);
		});

/**
 * Initialise Redplanet, pre and post campaign analysis
 * https://docs.google.com/presentation/d/1B8eg9GP5CUMTH9lkjtmkcExq32tx97nngXB0wOBoweI/edit#slide=id.g51461c3927_0_83
 */
export const init = (): Promise<void> => {
	if (commercialFeatures.launchpad && isInAuOrNz()) {
		return setupRedplanet();
	}
	return Promise.resolve();
};

export const resetModule = (): void => {
	initialised = false;
};
