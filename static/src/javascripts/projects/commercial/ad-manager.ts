import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { loadScript } from '@guardian/libs';

interface AdManagerI {
	prepare: () => void;
}

class AdManager implements AdManagerI {
	prepare() {
		//
	}
}

class GoogleAdManager extends AdManager {}

class OptOutAdManager extends AdManager {
	prepare() {
		// @ts-expect-error -- TODO
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO
		window.ootag = window.ootag || {};
		// @ts-expect-error -- TODO
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- TODO
		window.ootag.queue = window.ootag.queue || [];
		void loadScript('//cdn.optoutadvertising.com/script/ooguardian.js', {
			async: false,
		});
	}
}

let adManager: AdManager | undefined;

function createAdManager(consentState: ConsentState): void {
	if (adManager) {
		return;
	}
	if (consentState.canTarget) {
		adManager = new GoogleAdManager();
	} else {
		adManager = new OptOutAdManager();
	}
}

function getAdManager(): AdManager {
	if (!adManager) {
		throw new Error('Ad manager not defined');
	}
	return adManager;
}

export { getAdManager, createAdManager };
