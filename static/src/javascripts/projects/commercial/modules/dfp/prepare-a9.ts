import {
	getConsentFor,
	onConsent,
} from '@guardian/consent-management-platform';
import { log } from '@guardian/libs';
import { once } from 'lodash-es';
import config from '../../../../lib/config';
import { isGoogleProxy } from '../../../../lib/detect-google-proxy';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { a9 } from '../header-bidding/a9/a9';
import { shouldIncludeOnlyA9 } from '../header-bidding/utils';
import { dfpEnv } from './dfp-env';

const setupA9 = (): Promise<void | boolean> => {
	// TODO: Understand why we want to skip A9 for Google Proxy
	if (isGoogleProxy()) return Promise.resolve(false);

	// There are two articles that InfoSec would like to avoid loading scripts on
	if (commercialFeatures.isSecureContact) {
		return Promise.resolve();
	}

	let moduleLoadResult = Promise.resolve();
	if (
		shouldIncludeOnlyA9 ||
		(dfpEnv.hbImpl.a9 &&
			commercialFeatures.dfpAdvertising &&
			!commercialFeatures.adFree &&
			!config.get('page.hasPageSkin'))
	) {
		moduleLoadResult = import(
			/* webpackChunkName: "a9" */ '../../../../lib/a9-apstag.js'
		).then(() => {
			a9.initialise();

			return Promise.resolve();
		});
	}

	return moduleLoadResult;
};

const setupA9Once = once(setupA9);

/**
 * Initialise A9, Amazon header bidding library
 * https://ams.amazon.com/webpublisher/uam/docs/web-integration-documentation/integration-guide/javascript-guide/display.html
 */
export const init = (): Promise<void | boolean> =>
	onConsent()
		.then((consentState) => {
			if (getConsentFor('a9', consentState)) {
				return setupA9Once();
			} else {
				throw Error('No consent for a9');
			}
		})
		.catch((e) => {
			log('commercial', '⚠️ Failed to execute a9', e);
		});

export const _ = {
	setupA9,
};
