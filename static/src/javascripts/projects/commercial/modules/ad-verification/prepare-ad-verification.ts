import {
	EventTimer,
	bypassCommercialMetricsSampling as switchOffSampling,
} from '@guardian/commercial-core';
import { loadScript, log } from '@guardian/libs';
import { setForceSendMetrics } from '../../../common/modules/analytics/forceSendMetrics';
import { getAdvertById } from '../dfp/get-advert-by-id';
import { refreshAdvert } from '../dfp/load-advert';
import { stripDfpAdPrefixFrom } from '../header-bidding/utils';

const errorHandler = (error: Error) => {
	// Looks like some plugins block ad-verification
	// Avoid barraging Sentry with errors from these pageviews
	log('commercial', 'Failed to load Confiant:', error);
};

const confiantRefreshedSlots: string[] = [];

const maybeRefreshBlockedSlotOnce: ConfiantCallback = (
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

	log(
		'commercial',
		`${isBlocked ? '🚫 Blocked' : '🚨 Screened'} bad ad with Confiant`,
		{
			blockedSlotPath,
			blockingType,
			blockingId,
			wrapperId,
			tagId,
		},
	);

	// don’t run the logic if the ad is only screened
	if (!isBlocked || !blockedSlotPath) return;

	const advert = getAdvertById(blockedSlotPath);
	if (!advert) throw new Error(`No slot found for ${blockedSlotPath}`);

	const eventTimer = EventTimer.get();
	eventTimer.trigger(`${stripDfpAdPrefixFrom(advert.id)}-blockedByConfiant`);

	setForceSendMetrics(true);
	void switchOffSampling();

	advert.slot.setTargeting('confiant', String(blockingType));

	// if the slot has already been refreshed, don’t do anything
	if (confiantRefreshedSlots.includes(blockedSlotPath)) return;

	// refresh the blocked slot to get new ad
	refreshAdvert(advert);
	// mark it as refreshed so it won’t refresh multiple time
	confiantRefreshedSlots.push(blockedSlotPath);
};

/**
 * Initialise Confiant - block bad ads
 * https://www.confiant.com/solutions/quality
 * @returns Promise
 */
export const init = async (): Promise<void> => {
	const host = 'confiant-integrations.global.ssl.fastly.net';
	const id = '7oDgiTsq88US4rrBG0_Nxpafkrg';
	const remoteScriptUrl = `//${host}/${id}/gpt_and_prebid/config.js`;

	if (window.guardian.config.switches.confiantAdVerification) {
		await loadScript(remoteScriptUrl, {
			async: true,
		}).catch(errorHandler);

		if (!window.confiant?.settings) return;

		if (window.location.hash === '#confiantDevMode')
			window.confiant.settings.devMode = true;

		window.confiant.settings.callback = maybeRefreshBlockedSlotOnce;
	}

	return;
};

export const _ = {
	init,
	maybeRefreshBlockedSlotOnce,
	confiantRefreshedSlots,
};
