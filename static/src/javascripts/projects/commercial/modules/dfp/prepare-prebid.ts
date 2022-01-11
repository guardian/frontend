import { getConsentFor } from '@guardian/consent-management-platform';
import type { Framework } from '@guardian/consent-management-platform/dist/types';
import { log } from '@guardian/libs';
import { once } from 'lodash-es';
import { isGoogleProxy } from 'lib/detect-google-proxy';
import config from '../../../../lib/config';
import { getPageTargeting } from '../../../common/modules/commercial/build-page-targeting';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { getInitialConsentState } from '../../initialConsentState';
import { prebid } from '../header-bidding/prebid/prebid';
import { shouldIncludeOnlyA9 } from '../header-bidding/utils';
import { dfpEnv } from './dfp-env';

/*
 * Header bidding for display and video ads
 * https://docs.prebid.org/overview/intro.html
 */

const loadPrebid = async (framework: Framework): Promise<void> => {
	// TODO: Understand why we want to skip Prebid for Google Proxy
	if (isGoogleProxy()) return;

	if (
		!dfpEnv.hbImpl.prebid ||
		!commercialFeatures.dfpAdvertising ||
		commercialFeatures.adFree ||
		config.get('page.hasPageSkin') ||
		shouldIncludeOnlyA9
	)
		return;

	await import(
		// @ts-expect-error -- there’s no types for Prebid.js
		/* webpackChunkName: "Prebid.js" */ 'prebid.js/build/dist/prebid'
	);

	getPageTargeting();
	prebid.initialise(window, framework);

	return;
};

const setupPrebid = (): Promise<void> =>
	getInitialConsentState()
		.then((state) => {
			let framework: Framework | null = null;
			if (state.tcfv2) framework = 'tcfv2';
			if (state.ccpa) framework = 'ccpa';
			if (state.aus) framework = 'aus';

			if (!framework) {
				return Promise.reject('Unknown framework');
			}
			if (!getConsentFor('prebid', state)) {
				return Promise.reject('No consent for prebid');
			}
			return loadPrebid(framework);
		})
		.catch((e) => {
			log('commercial', '⚠️ Failed to execute prebid', e);
		});

export const setupPrebidOnce: () => Promise<void> = once(setupPrebid);

export const init = (): Promise<void> => {
	void setupPrebidOnce();
	return Promise.resolve();
};

export const _ = {
	setupPrebid,
};
