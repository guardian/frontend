import { onConsentChange } from '@guardian/consent-management-platform';
import type { TCFv2ConsentState } from '@guardian/consent-management-platform/dist/types/tcfv2';
import { loadScript } from '@guardian/libs';
import fastdom from 'fastdom';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { buildPfpEvent } from 'common/modules/video/ga-helper';
import config from 'lib/config';
import { constructQuery } from 'lib/url';
import { getPermutivePFPSegments } from '../commercial/permutive';

interface WindowLocal extends Window {
	ga: UniversalAnalytics.ga;
	onYouTubeIframeAPIReady?: () => void;
	YT?: typeof YT;
}

const scriptSrc = 'https://www.youtube.com/iframe_api';
const promise = new Promise<void>((resolve) => {
	if ((window as WindowLocal).YT?.Player) {
		resolve();
	} else {
		(window as WindowLocal).onYouTubeIframeAPIReady = resolve;
	}
});

const loadYoutubeJs = () => {
	void loadScript(scriptSrc, {});
};

const addVideoStartedClass = (el: HTMLElement | null) => {
	if (el) {
		el.classList.add('youtube__video-started');
	}
};

let tcfData: TCFv2ConsentState | undefined = undefined;

interface ConsentState {
	framework: null | string;
	canTarget: boolean;
}

let consentState: ConsentState = {
	framework: null,
	canTarget: false,
};

onConsentChange((cmpConsent) => {
	if (cmpConsent.ccpa) {
		consentState = {
			framework: 'ccpa',
			canTarget: !cmpConsent.ccpa.doNotSell,
		};
	} else if (cmpConsent.aus) {
		consentState = {
			framework: 'aus',
			canTarget: cmpConsent.aus.personalisedAdvertising,
		};
	} else {
		tcfData = cmpConsent.tcfv2;
		consentState = {
			framework: 'tcfv2',
			canTarget: tcfData
				? Object.values(tcfData.consents).every(Boolean)
				: false,
		};
	}
});

interface LocalEvent extends Omit<Event, 'target'> {
	data: string;
	target: YT.Player;
}

interface Handlers {
	onPlayerReady: (event: LocalEvent) => void;
	onPlayerStateChange: (event: LocalEvent) => void;
}

const onPlayerStateChangeEvent = (
	event: LocalEvent,
	handlers?: Handlers,
	el?: HTMLElement | null,
) => {
	if (el && config.get('page.isDev')) {
		const states = (window.YT.PlayerState as unknown) as string[];
		const state = Object.keys(states).find(
			(key: string) =>
				states[(key as unknown) as YT.PlayerState] === event.data,
		);
		if (state) {
			console.log(`Player ${el.id} is ${state}`);
		}
	}

	// change class according to the current state
	// TODO: Fix this so we can add poster image.
	fastdom.mutate(() => {
		['ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'].forEach(
			(status: string) => {
				if (el) {
					el.classList.toggle(
						`youtube__video-${status.toLocaleLowerCase()}`,
						event.data ===
							window.YT.PlayerState[
								(status as unknown) as YT.PlayerState
							],
					);
					const fcItem = el.closest('fc-item');
					if (fcItem) {
						fcItem.classList.toggle(
							`fc-item--has-video-main-media__${status.toLocaleLowerCase()}`,
							event.data ===
								window.YT.PlayerState[
									(status as unknown) as YT.PlayerState
								],
						);
					}
					addVideoStartedClass(el);
				}
			},
		);
	});

	if (handlers && typeof handlers.onPlayerStateChange === 'function') {
		handlers.onPlayerStateChange(event);
	}
};

const onPlayerReadyEvent = (
	event: LocalEvent,
	handlers?: Handlers,
	el?: HTMLElement | null,
) => {
	fastdom.mutate(() => {
		if (el) {
			el.classList.add('youtube__video-ready');
			const fcItem = el.closest('fc-item');
			if (fcItem) {
				fcItem.classList.add('fc-item--has-video-main-media__ready');
			}
		}
	});

	// we should be able to remove this check once everything is using flow/ES^
	if (handlers && typeof handlers.onPlayerReady === 'function') {
		handlers.onPlayerReady(event);
	}
};

interface AdsConfig {
	adTagParameters?: {
		iu: string;
		cust_params: string;
		cmpGdpr: number;
		cmpVcd: string | undefined;
		cmpGvcd: string | undefined;
	};
	disableAds?: boolean;
	nonPersonalizedAd?: boolean;
	restrictedDataProcessor?: boolean;
}

const createAdsConfig = (
	adFree: boolean,
	consentState: ConsentState,
): AdsConfig => {
	if (adFree) {
		return { disableAds: true };
	}

	const custParams = getPageTargeting() as Record<string, string | string[]>;
	custParams.permutive = getPermutivePFPSegments() as string[];

	const adsConfig: AdsConfig = {
		adTagParameters: {
			iu: config.get('page.adUnit') as string,
			cust_params: encodeURIComponent(constructQuery(custParams)),
			cmpGdpr: tcfData?.gdprApplies ? 1 : 0,
			cmpVcd: tcfData?.tcString,
			cmpGvcd: tcfData?.addtlConsent,
		},
	};

	if (consentState.framework === 'ccpa' || consentState.framework === 'aus') {
		adsConfig.restrictedDataProcessor = !consentState.canTarget;
	} else {
		adsConfig.nonPersonalizedAd = !consentState.canTarget;
	}

	return adsConfig;
};

const setupPlayer = (
	el: HTMLElement,
	videoId: string,
	onReady: (event: LocalEvent) => void,
	onStateChange: (event: LocalEvent) => void,
	onError: (event: LocalEvent) => void,
	onAdStart: () => void,
	onAdEnd: () => void,
): YT.Player => {
	// relatedChannels needs to be an array, as per YouTube's IFrame Embed Config API
	const relatedChannels: string[] = [];
	/**
	 * There's an issue with relatedChannels where
	 * if we pass a populated array no related videos are
	 * shown. Therefore for the time being we will pass an
	 * empty array.
	 */

	const adsConfig = createAdsConfig(commercialFeatures.adFree, consentState);

	// @ts-expect-error -- ts is confused by multiple constructors
	return new window.YT.Player(el.id, {
		host:
			commercialFeatures.adFree ||
			!el.classList.contains('youtube-media-atom__iframe')
				? 'https://www.youtube-nocookie.com'
				: 'https://www.youtube.com',
		videoId,
		width: '100%',
		height: '100%',
		events: {
			onReady,
			onStateChange,
			onError,
			onAdStart,
			onAdEnd,
		},
		embedConfig: {
			relatedChannels,
			adsConfig,
		},
	});
};

const hasPlayerStarted = (event: LocalEvent) =>
	event.target.getCurrentTime() > 0;

const getPlayerIframe = (videoId: string) =>
	document.getElementById(`youtube-${videoId}`);

export const initYoutubePlayer = (
	el: HTMLElement,
	handlers: Handlers,
	videoId: string,
): Promise<YT.Player> => {
	loadYoutubeJs();
	return promise.then(() => {
		const onPlayerStateChange = (event: LocalEvent) => {
			onPlayerStateChangeEvent(event, handlers, getPlayerIframe(videoId));
		};

		const onPlayerReady = (event: LocalEvent) => {
			const iframe = getPlayerIframe(videoId);
			if (hasPlayerStarted(event)) {
				addVideoStartedClass(iframe);
			}
			onPlayerReadyEvent(event, handlers, iframe);
		};

		const onPlayerError = (event: LocalEvent) => {
			console.error(`YOUTUBE: ${event.data}`);
			console.dir(event);
		};

		const gaTracker = config.get(
			'googleAnalytics.trackers.editorial',
		) as string;

		const onAdStart = () => {
			(window as WindowLocal).ga(
				`${gaTracker}.send`,
				'event',
				buildPfpEvent('adStart', videoId),
			);
		};

		const onAdEnd = () => {
			(window as WindowLocal).ga(
				`${gaTracker}.send`,
				'event',
				buildPfpEvent('adEnd', videoId),
			);
		};

		return setupPlayer(
			el,
			videoId,
			onPlayerReady,
			onPlayerStateChange,
			onPlayerError,
			onAdStart,
			onAdEnd,
		);
	});
};

export const _ = { createAdsConfig };
