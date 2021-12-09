/* A regionalised container for all the commercial tags. */

import {
	fbPixel,
	ias,
	inizio,
	permutive,
	remarketing,
	twitter,
} from '@guardian/commercial-core';
import {
	getConsentFor,
	onConsentChange,
} from '@guardian/consent-management-platform';
import { getInitialConsentState } from 'commercial/initialConsentState';
import config from '../../../lib/config';
import fastdom from '../../../lib/fastdom-promise';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { imrWorldwide } from './third-party-tags/imr-worldwide';
import { imrWorldwideLegacy } from './third-party-tags/imr-worldwide-legacy';

const addScripts = (tags) => {
	const ref = document.scripts[0];
	const frag = document.createDocumentFragment();
	let hasScriptsToInsert = false;

	tags.forEach((tag) => {
		if (tag.loaded === true) return;

		if (tag.beforeLoad) tag.beforeLoad();

		// Tag is either an image, a snippet or a script.
		if (tag.useImage === true && typeof tag.url !== 'undefined') {
			new Image().src = tag.url;
		} else if (tag.insertSnippet) {
			tag.insertSnippet();
		} else {
			hasScriptsToInsert = true;
			const script = document.createElement('script');
			if (typeof tag.url !== 'undefined') {
				script.src = tag.url;
			}
			script.onload = tag.onLoad;
			if (tag.async === true) {
				script.setAttribute('async', '');
			}
			if (tag.attrs) {
				tag.attrs.forEach((attr) => {
					script.setAttribute(attr.name, attr.value);
				});
			}
			frag.appendChild(script);
		}
		tag.loaded = true;
	});

	if (hasScriptsToInsert) {
		fastdom.mutate(() => {
			if (ref && ref.parentNode) {
				ref.parentNode.insertBefore(frag, ref);
			}
		});
	}
};

const insertScripts = (
	advertisingServices,
	performanceServices, // performanceServices always run
) => {
	addScripts(performanceServices);
	return getInitialConsentState().then((state) => {
		const consentedAdvertisingServices = advertisingServices.filter(
			(script) => getConsentFor(script.name, state),
		);

		if (consentedAdvertisingServices.length > 0) {
			addScripts(consentedAdvertisingServices);
		}
	});
};

const loadOther = () => {
	const advertisingServices = [
		remarketing({ shouldRun: config.get('switches.remarketing', false) }),
		permutive({ shouldRun: config.get('switches.permutive', false) }),
		ias({ shouldRun: config.get('switches.iasAdTargeting', false) }),
		inizio({ shouldRun: config.get('switches.inizio', false) }),
		fbPixel({
			shouldRun: config.get('switches.facebookTrackingPixel', false),
		}),
		twitter({ shouldRun: config.get('switches.twitterUwt', false) }),
	].filter((_) => _.shouldRun);

	const performanceServices = [
		imrWorldwide, // only in AU & NZ
		imrWorldwideLegacy, // only in AU & NZ
	].filter((_) => _.shouldRun);

	return insertScripts(advertisingServices, performanceServices);
};

const init = () => {
	if (!commercialFeatures.thirdPartyTags) {
		return Promise.resolve(false);
	}

	return loadOther();
};

export { init };
export const _ = {
	insertScripts,
	loadOther,
};
