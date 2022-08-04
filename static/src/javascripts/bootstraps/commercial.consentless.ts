import { getAdManager } from 'commercial/ad-manager';

const prepareAds = (): void => {
	const adManager = getAdManager();
	adManager.prepare();
};

const init = (): Promise<void> => {
	prepareAds();
	return Promise.resolve();
};

export { init };
