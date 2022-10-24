import { initMessenger } from '@guardian/commercial-core';
import {
	getConsentFor,
	onConsent,
} from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { loadScript } from '@guardian/libs';
import { init as initMeasureAdLoad } from 'commercial/modules/messenger/measure-ad-load';
import raven from '../../../../lib/raven';
import reportError from '../../../../lib/report-error';
import { removeSlots } from '../../../commercial/modules/remove-slots';
import { getPageTargeting } from '../../../common/modules/commercial/build-page-targeting';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import type { IdentityUserIdentifiers } from '../../../common/modules/identity/api';
import { getUserIdentifiersFromApi } from '../../../common/modules/identity/api';
import { init as background } from '../messenger/background';
import { init as sendClick } from '../messenger/click';
import { init as disableRefresh } from '../messenger/disable-refresh';
import { init as initGetPageTargeting } from '../messenger/get-page-targeting';
import { init as initGetPageUrl } from '../messenger/get-page-url';
import { init as getStyles } from '../messenger/get-stylesheet';
import { init as passback } from '../messenger/passback';
import { init as resize } from '../messenger/resize';
import { init as scroll } from '../messenger/scroll';
import { init as type } from '../messenger/type';
import { init as viewport } from '../messenger/viewport';
import { fillAdvertSlots } from './fill-advert-slots';
import { onSlotLoad } from './on-slot-load';
import { onSlotRender } from './on-slot-render';
import { onSlotViewableFunction } from './on-slot-viewable';
import { refreshOnResize } from './refresh-on-resize';

initMessenger(
	[
		type,
		getStyles,
		initGetPageTargeting,
		initGetPageUrl,
		initMeasureAdLoad,
		resize,
		sendClick,
		background,
		disableRefresh,
		passback,
	],
	[scroll, viewport],
	reportError,
);

const setDfpListeners = (): void => {
	const pubads = window.googletag.pubads();

	pubads.addEventListener(
		'slotRenderEnded',
		raven.wrap<typeof onSlotRender>(onSlotRender),
	);
	pubads.addEventListener(
		'slotOnload',
		raven.wrap<typeof onSlotLoad>(onSlotLoad),
	);
	pubads.addEventListener('impressionViewable', onSlotViewableFunction());
};

const setPageTargeting = (consentState: ConsentState) =>
	Object.entries(getPageTargeting(consentState)).forEach(([key, value]) => {
		if (!value) return;
		window.googletag.pubads().setTargeting(key, value);
	});

/**
 * Also known as PPID
 */
const setPublisherProvidedId = (): void =>
	getUserIdentifiersFromApi(
		(userIdentifiers: IdentityUserIdentifiers | null) => {
			if (userIdentifiers?.googleTagId) {
				window.googletag
					.pubads()
					.setPublisherProvidedId(userIdentifiers.googleTagId);
			}
		},
	);

export const init = (): Promise<void> => {
	const setupAdvertising = (): Promise<void> => {
		return onConsent().then((consentState: ConsentState) => {
			let canRun = true;

			if (consentState.canTarget) {
				window.googletag.cmd.push(setPublisherProvidedId);
			}

			if (consentState.ccpa) {
				// CCPA mode
				// canRun stays true, set RDP flag
				window.googletag.cmd.push(() => {
					window.googletag.pubads().setPrivacySettings({
						restrictDataProcessing: !consentState.canTarget,
					});
				});
			} else if (consentState.tcfv2) {
				// TCFv2 mode
				canRun = getConsentFor('googletag', consentState);
			} else if (consentState.aus) {
				// AUS mode
				// canRun stays true, set NPA flag
				const npaFlag = !getConsentFor('googletag', consentState);
				window.googletag.cmd.push(() => {
					window.googletag
						.pubads()
						.setRequestNonPersonalizedAds(npaFlag ? 1 : 0);
				});
			}

			// Prebid will already be loaded, and window.googletag is stubbed in `commercial.js`.
			// Just load googletag. Prebid will already be loaded, and googletag is already added to the window by Prebid.
			if (canRun) {
				// Note: fillAdvertSlots isn't synchronous like most buffered cmds, it's a promise. It's put in here to ensure
				// it strictly follows preceding prepare-googletag work (and the module itself ensures dependencies are
				// fulfilled), but don't assume fillAdvertSlots is complete when queueing subsequent work using cmd.push
				window.googletag.cmd.push(
					setDfpListeners,
					() => {
						setPageTargeting(consentState);
					},
					refreshOnResize,
					() => {
						void fillAdvertSlots();
					},
				);

				void loadScript(
					window.guardian.config.page.libs.googletag ??
						'//www.googletagservices.com/tag/js/gpt.js',
					{ async: false },
				);
			}
			return Promise.resolve();
		});
	};

	if (commercialFeatures.dfpAdvertising) {
		return (
			setupAdvertising()
				// on error, remove all slots
				.catch(removeSlots)
		);
	}

	return removeSlots();
};
