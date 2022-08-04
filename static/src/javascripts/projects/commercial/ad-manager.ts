import type { ConsentState } from '@guardian/consent-management-platform/dist/types';

// do not use :)
class AdManager {}

class GoogleAdManager extends AdManager {
	//
}

class OptOutAdManager extends AdManager {
	//
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

/**
 * inherited by GoogleAdManager, OptOutAdManager
 *
 *
 */
