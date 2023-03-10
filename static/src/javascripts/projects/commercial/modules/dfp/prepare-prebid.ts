/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import {
	getConsentFor,
	onConsent,
} from '@guardian/consent-management-platform';
import type { Framework } from '@guardian/consent-management-platform/dist/types';
import { log } from '@guardian/libs';
import { once } from 'lodash-es';
import { isInCanada } from 'common/modules/commercial/geo-utils';
import { isGoogleProxy } from 'lib/detect-google-proxy';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { prebid } from '../header-bidding/prebid/prebid';
import { shouldIncludeOnlyA9 } from '../header-bidding/utils';
import { dfpEnv } from './dfp-env';

const shouldLoadPrebid = () =>
	!isGoogleProxy() &&
	dfpEnv.hbImpl.prebid &&
	commercialFeatures.dfpAdvertising &&
	!commercialFeatures.adFree &&
	!window.guardian.config.page.hasPageSkin &&
	!shouldIncludeOnlyA9 &&
	!isInCanada();

const loadPrebid = async (framework: Framework): Promise<void> => {
	if (shouldLoadPrebid()) {
		await import(
			// @ts-expect-error -- there’s no types for Prebid.js
			/* webpackChunkName: "Prebid.js" */ 'prebid.js/build/dist/prebid'
		);
		prebid.initialise(window, framework);
	}
};

const setupPrebid = (): Promise<void> =>
	onConsent()
		.then((consentState) => {
			if (!consentState.framework) {
				return Promise.reject('Unknown framework');
			}
			if (!getConsentFor('prebid', consentState)) {
				return Promise.reject('No consent for prebid');
			}
			return loadPrebid(consentState.framework);
		})
		.catch((e) => {
			log('commercial', '⚠️ Failed to execute prebid', e);
		});

export const setupPrebidOnce: () => Promise<void> = once(setupPrebid);

/**
 * Initialise prebid - header bidding for display and video ads
 * https://docs.prebid.org/overview/intro.html
 * @returns Promise
 */
export const init = (): Promise<void> => setupPrebidOnce();

export const _ = {
	setupPrebid,
};
