/* A regionalised container for all the commercial tags. */

import {
	fbPixel,
	ias,
	inizio,
	permutive,
	remarketing,
	twitter,
} from '@guardian/commercial-core';
import type { ThirdPartyTag } from '@guardian/commercial-core';
import {
	getConsentFor,
	onConsent,
} from '@guardian/consent-management-platform';
import fastdom from '../../../lib/fastdom-promise';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { imrWorldwide } from './third-party-tags/imr-worldwide';
import { imrWorldwideLegacy } from './third-party-tags/imr-worldwide-legacy';

const addScripts = (tags: ThirdPartyTag[]) => {
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
			// script.onload cannot be undefined
			script.onload = tag.onLoad ?? null;
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

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive
	if (hasScriptsToInsert) {
		return fastdom.mutate(() => {
			if (ref.parentNode) {
				ref.parentNode.insertBefore(frag, ref);
			}
		});
	}
	return Promise.resolve();
};

const insertScripts = async (
	advertisingServices: ThirdPartyTag[],
	performanceServices: ThirdPartyTag[], // performanceServices always run
): Promise<void> => {
	await addScripts(performanceServices);
	const consentState = await onConsent();
	const consentedAdvertisingServices = advertisingServices.filter(
		(script) => {
			if (script.name === undefined) return false;
			return getConsentFor(script.name, consentState);
		},
	);

	if (consentedAdvertisingServices.length > 0) {
		await addScripts(consentedAdvertisingServices);
	}
};

const loadOther = (): Promise<void> => {
	const advertisingServices: ThirdPartyTag[] = [
		remarketing({
			shouldRun: window.guardian.config.switches.remarketing ?? false,
		}),
		permutive({
			shouldRun: window.guardian.config.switches.permutive ?? false,
		}),
		ias({
			shouldRun: window.guardian.config.switches.iasAdTargeting ?? false,
		}),
		inizio({ shouldRun: window.guardian.config.switches.inizio ?? false }),
		fbPixel({
			shouldRun:
				window.guardian.config.switches.facebookTrackingPixel ?? false,
		}),
		twitter({
			shouldRun: window.guardian.config.switches.twitterUwt ?? false,
		}),
	].filter((_) => _.shouldRun);

	const performanceServices: ThirdPartyTag[] = [
		// a.k.a Nielsen Online - provides measurement and analysis of online audiences,
		// advertising, video, consumer-generated media, word of mouth, commerce and consumer behavior.
		imrWorldwide, // only in AU & NZ
		imrWorldwideLegacy, // only in AU & NZ
	].filter((_) => _.shouldRun);

	return insertScripts(advertisingServices, performanceServices);
};

const init = async (): Promise<boolean> => {
	if (!commercialFeatures.thirdPartyTags) {
		return Promise.resolve(false);
	}
	await loadOther();
	return Promise.resolve(true);
};

export { init };
export const _ = {
	insertScripts,
	loadOther,
};
