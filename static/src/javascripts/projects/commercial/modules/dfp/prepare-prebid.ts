import {
	getConsentFor,
	onConsentChange,
} from '@guardian/consent-management-platform';
import type { Framework } from '@guardian/consent-management-platform/dist/types';
import { once } from 'lodash-es';
import config from '../../../../lib/config';
import { isGoogleProxy } from '../../../../lib/detect';
import { getPageTargeting } from '../../../common/modules/commercial/build-page-targeting';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { prebid } from '../header-bidding/prebid/prebid';
import { shouldIncludeOnlyA9 } from '../header-bidding/utils';
import { dfpEnv } from './dfp-env';

const loadPrebid = async (framework: Framework): Promise<void> => {
	if (
		!dfpEnv.hbImpl.prebid ||
		!commercialFeatures.dfpAdvertising ||
		commercialFeatures.adFree ||
		config.get('page.hasPageSkin') ||
		isGoogleProxy() ||
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

const setupPrebid = async (): Promise<void> => {
	let resolvePrebidLoaded: (value: void | PromiseLike<void>) => void;
	let rejectPrebidLoaded: (
		reason: 'no consent for prebid' | 'unknown framework',
	) => void;
	const promise = new Promise<void>((resolve, reject) => {
		resolvePrebidLoaded = resolve;
		rejectPrebidLoaded = reject;
	});

	onConsentChange((state) => {
		if (!getConsentFor('prebid', state)) {
			rejectPrebidLoaded('no consent for prebid');
			return;
		}

		let framework: Framework | null = null;
		if (state.tcfv2) framework = 'tcfv2';
		if (state.ccpa) framework = 'ccpa';
		if (state.aus) framework = 'aus';

		if (!framework) {
			rejectPrebidLoaded('unknown framework');
			return;
		}

		void loadPrebid(framework).then(() => {
			resolvePrebidLoaded();
		});
	});

	return promise;
};

export const setupPrebidOnce: () => Promise<void> = once(setupPrebid);

export const init = (): Promise<void> => {
	void setupPrebidOnce();
	return Promise.resolve();
};

export const _ = {
	setupPrebid,
};
