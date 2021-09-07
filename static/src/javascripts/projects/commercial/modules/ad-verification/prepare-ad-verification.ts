import { loadScript, log } from '@guardian/libs';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { refreshConfiantBlockedAds } from 'common/modules/experiments/tests/refresh-confiant-blocked-ads';
import { getAdvertById } from '../dfp/get-advert-by-id';
import { refreshAdvert } from '../dfp/load-advert';

const errorHandler = (error: Error) => {
	// Looks like some plugins block ad-verification
	// Avoid barraging Sentry with errors from these pageviews
	log('commercial', 'Failed to load Confiant:', error);
};

const confiantRefreshedSlots: string[] = [];

const shouldRefresh = () =>
	isInVariantSynchronous(refreshConfiantBlockedAds, 'variant');

const refreshBlockedSlotOnce: ConfiantCallback = (
	blockingType,
	blockingId,
	isBlocked,
	wrapperId,
	tagId,
	impressionsData,
) => {
	const prebidSlotElementId = impressionsData?.prebid?.s;
	const dfpSlotElementId = impressionsData?.dfp?.s;
	const blockedSlotPath = prebidSlotElementId ?? dfpSlotElementId;

	// check if ad is blocked and haven't refreshed the slot yet.
	if (
		isBlocked &&
		!!blockedSlotPath &&
		!confiantRefreshedSlots.includes(blockedSlotPath)
	) {
		log('commercial', '🚫 Blocked bad ad with Confiant', {
			blockingType,
			blockingId,
			wrapperId,
			tagId,
		});
		const slots = window.googletag?.pubads().getSlots() ?? [];
		slots.forEach((currentSlot) => {
			if (blockedSlotPath === currentSlot.getSlotElementId()) {
				// refresh the blocked slot to get new ad
				const advert = getAdvertById(blockedSlotPath);
				if (advert) refreshAdvert(advert);
				// mark it as refreshed so it won't refresh multiple time
				confiantRefreshedSlots.push(blockedSlotPath);
			}
		});
	}
	return Promise.resolve();
};

export const init = async (): Promise<void> => {
	const host = 'confiant-integrations.global.ssl.fastly.net';

	if (window.guardian.config.switches.confiantAdVerification) {
		await loadScript(
			`//${host}/7oDgiTsq88US4rrBG0_Nxpafkrg/gpt_and_prebid/config.js`,
			{ async: true },
		).catch(errorHandler);

		if (shouldRefresh() && window.confiant?.settings) {
			if (window.location.hash === '#confiantDevMode')
				window.confiant.settings.devMode = true;
			window.confiant.settings.callback = refreshBlockedSlotOnce;
		}
	}

	return;
};
