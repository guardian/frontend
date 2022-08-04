/* eslint-disable @typescript-eslint/no-unnecessary-condition -- ...????*/
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { loadScript } from '@guardian/libs';
import { init as prepareGoogletag } from './modules/dfp/prepare-googletag';
import { initPermutive } from './modules/dfp/prepare-permutive';

interface AdManagerI {
	prepare: () => void;
}

class AdManager implements AdManagerI {
	prepare() {
		//
	}
}

class GoogleAdManager extends AdManager {
	prepare() {
		void initPermutive().then(() => prepareGoogletag());
	}
}

class OptOutAdManager extends AdManager {
	prepare() {
		window.ootag = window.ootag || {};
		window.ootag.queue = window.ootag.queue || [];
		window.ootag.queue.push(function () {
			window.ootag.initializeOo({
				publisher: 33,
				// noLogging: 0,
				// consentTimeOutMS: 5000,
				// onlyNoConsent: 1,
			});
			window.ootag.addParameter('test', 'yes');
		});

		ootag.queue.push(function () {
			ootag.defineSlot({
				adSlot: 'homepage-lead',
				targetId: 'dfp-ad--top-above-nav',
				filledCallback: () => {
					console.log('filled top-above-nav');
				},
				emptyCallback: () => {
					console.log('empty top-above-nav');
				},
			});
			// ootag.makeRequests();
		});

		void loadScript('//cdn.optoutadvertising.com/script/ootag.min.js', {
			async: false,
		});
	}
}

let adManager: AdManager | undefined;

function createAdManager(consentState: ConsentState): AdManager {
	if (adManager) {
		return adManager;
	}
	if (consentState.canTarget) {
		adManager = new GoogleAdManager();
	} else {
		adManager = new OptOutAdManager();
	}
	return adManager;
}

function getAdManager(): AdManager {
	if (!adManager) {
		throw new Error('Ad manager not defined');
	}
	return adManager;
}

export { getAdManager, createAdManager };
