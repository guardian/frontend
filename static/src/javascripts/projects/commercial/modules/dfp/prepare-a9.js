import { getConsentFor } from '@guardian/consent-management-platform';
import { getInitialConsentState } from 'commercial/initialConsentState';
import { once } from 'lodash-es';
import config from '../../../../lib/config';
import { isGoogleProxy } from '../../../../lib/detect-google-proxy';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import a9 from '../header-bidding/a9/a9';
import { shouldIncludeOnlyA9 } from '../header-bidding/utils';
import { dfpEnv } from './dfp-env';
import { log } from '@guardian/libs';

const setupA9 = () => {
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

export const init = () => {
	void getInitialConsentState()
		.then((state) => {
			if (getConsentFor('a9', state)) {
				return setupA9Once();
			} else {
				throw Error('No consent for a9');
			}
		})
		.catch((e) => {
			log('commercial', '⚠️ Failed to execute a9', e);
		});

	return Promise.resolve();
};

export const _ = {
	setupA9,
};
