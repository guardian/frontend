import {
	getConsentFor,
	onConsentChange,
} from '@guardian/consent-management-platform';
import { loadScript, storage } from '@guardian/libs';
import { init as initMeasureAdLoad } from 'commercial/modules/messenger/measure-ad-load';
import config from '../../../../lib/config';
import raven from '../../../../lib/raven';
import { removeSlots } from '../../../commercial/modules/remove-slots';
import { getPageTargeting } from '../../../common/modules/commercial/build-page-targeting';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import type { IdentityUser } from '../../../common/modules/identity/api';
import { getUserFromApi } from '../../../common/modules/identity/api';
import { adFreeSlotRemove } from '../ad-free-slot-remove';
import { init as initMessenger } from '../messenger';
import { init as background } from '../messenger/background';
import { init as sendClick } from '../messenger/click';
import { init as disableRefresh } from '../messenger/disable-refresh';
import { init as initGetPageTargeting } from '../messenger/get-page-targeting';
import { init as initGetPageUrl } from '../messenger/get-page-url';
import { init as getStyles } from '../messenger/get-stylesheet';
import { init as hide } from '../messenger/hide';
import { init as resize } from '../messenger/resize';
import { init as scroll } from '../messenger/scroll';
import { init as type } from '../messenger/type';
import { init as viewport } from '../messenger/viewport';
import { fillAdvertSlots } from './fill-advert-slots';
import { onSlotLoad } from './on-slot-load';
import { onSlotRender } from './on-slot-render';
import { onSlotViewableFunction } from './on-slot-viewable';
import { onSlotVisibilityChanged } from './on-slot-visibility-changed';
import { refreshOnResize } from './refresh-on-resize';

initMessenger(
	type,
	getStyles,
	initGetPageTargeting,
	initGetPageUrl,
	initMeasureAdLoad,
	resize,
	hide,
	scroll,
	viewport,
	sendClick,
	background,
	disableRefresh,
);

const setDfpListeners = (): void => {
	const pubads = window.googletag?.pubads();
	if (!pubads) return;
	pubads.addEventListener(
		'slotRenderEnded',
		raven.wrap(onSlotRender) as (arg0: any) => void,
	);
	pubads.addEventListener(
		'slotOnload',
		raven.wrap(onSlotLoad) as (arg0: any) => void,
	);

	pubads.addEventListener('impressionViewable', onSlotViewableFunction());

	pubads.addEventListener('slotVisibilityChanged', onSlotVisibilityChanged);
	if (storage.session.isAvailable()) {
		const pageViews =
			(storage.session.get('gu.commercial.pageViews') as number) || 0;
		storage.session.set('gu.commercial.pageViews', pageViews + 1);
	}
};

const setPageTargeting = (): void => {
	const pubads = window.googletag?.pubads();
	if (!pubads) return;
	// because commercialFeatures may export itself as {} in the event of an exception during construction
	const targeting = getPageTargeting() as Record<string, any>;
	Object.keys(targeting).forEach((key) => {
		pubads.setTargeting(key, targeting[key]);
	});
};

const setPublisherProvidedId = (): void => {
	// Also known as PPID
	getUserFromApi((user: IdentityUser | null) => {
		if (user?.privateFields.googleTagId) {
			window.googletag
				?.pubads()
				.setPublisherProvidedId(user.privateFields.googleTagId);
		}
	});
};

export const init = (): Promise<void> => {
	const setupAdvertising = (): Promise<void> => {
		// note: fillAdvertSlots isn't synchronous like most buffered cmds, it's a promise. It's put in here to ensure
		// it strictly follows preceding prepare-googletag work (and the module itself ensures dependencies are
		// fulfilled), but don't assume fillAdvertSlots is complete when queueing subsequent work using cmd.push
		window.googletag?.cmd.push(
			setDfpListeners,
			// @ts-expect-error - googletag.CommandArray.push() !== Array.push, it accepts multiple fn arguments
			setPageTargeting,
			refreshOnResize,
			() => {
				void fillAdvertSlots();
			},
		);

		onConsentChange((state) => {
			let canRun = true;
			if (state.ccpa) {
				const doNotSell = state.ccpa.doNotSell;
				// CCPA mode
				window.googletag?.cmd.push(() => {
					window.googletag?.pubads().setPrivacySettings({
						restrictDataProcessing: doNotSell,
					});
				});
				if (!state.ccpa.doNotSell) {
					window.googletag?.cmd.push(setPublisherProvidedId);
				}
			} else {
				let npaFlag = false;
				if (state.tcfv2) {
					// TCFv2 mode
					npaFlag =
						Object.keys(state.tcfv2.consents).length === 0 ||
						Object.values(state.tcfv2.consents).includes(false);
					canRun = getConsentFor('googletag', state);
				} else if (state.aus) {
					// AUS mode
					// canRun stays true, set NPA flag if consent is retracted
					npaFlag = !getConsentFor('googletag', state);
				}
				window.googletag?.cmd.push(() => {
					window.googletag
						?.pubads()
						.setRequestNonPersonalizedAds(npaFlag ? 1 : 0);
				});
				if (!npaFlag) {
					window.googletag?.cmd.push(setPublisherProvidedId);
				}
			}
			// Prebid will already be loaded, and window.googletag is stubbed in `commercial.js`.
			// Just load googletag. Prebid will already be loaded, and googletag is already added to the window by Prebid.
			if (canRun) {
				void loadScript(
					(config as {
						get: (arg: string, defaultValue: any) => string;
					}).get(
						'libs.googletag',
						'//www.googletagservices.com/tag/js/gpt.js',
					),
					{ async: false },
				);
			}
		});
		return Promise.resolve();
	};

	if (commercialFeatures.dfpAdvertising) {
		// A promise error here, from a failed module load,
		// could be a network problem or an intercepted request.
		// Abandon the init sequence.
		setupAdvertising().then(adFreeSlotRemove).catch(removeSlots);

		return Promise.resolve();
	}

	return removeSlots();
};
