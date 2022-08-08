import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { getBreakpoint, getViewport } from 'lib/detect-viewport';

const addMobileInlineAds = async () => {};

const addDesktopInlineAds = async () => {};

const addInlineAds = (): Promise<void> =>
	getBreakpoint(getViewport().width) === 'mobile'
		? addMobileInlineAds()
		: addDesktopInlineAds();

const initInline = async () => {
	// do we need to rerun for the sign-in gate?
	if (!commercialFeatures.articleBodyAdverts) {
		return false;
	}

	await addInlineAds();
};

export { initInline };
