import { getPermutivePFPSegments } from '@guardian/commercial-core';
import { onConsentChange } from '@guardian/consent-management-platform';
import type { Framework } from '@guardian/consent-management-platform/dist/types';
import type { TCFv2ConsentState } from '@guardian/consent-management-platform/dist/types/tcfv2';
import { loadScript } from '@guardian/libs';
import fastdom from 'fastdom';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { buildPfpEvent } from 'common/modules/video/ga-helper';
import config from 'lib/config';
import { constructQuery } from 'lib/url';

interface WindowLocal extends Window {
	ga: UniversalAnalytics.ga;
	onYouTubeIframeAPIReady?: () => void;
	YT?: typeof YT;
}

const scriptSrc = 'https://www.youtube.com/iframe_api';
const youtubeReady = new Promise<void>((resolve) => {
	const localWindow = window as WindowLocal;

	if (localWindow.YT?.Player) {
		resolve();
	} else if (localWindow.onYouTubeIframeAPIReady) {
		// If there’s already a callback registered.
		// This happens with the standalone commercial bundle

		const previousApiLoadCallback = localWindow.onYouTubeIframeAPIReady;

		localWindow.onYouTubeIframeAPIReady = () => {
			previousApiLoadCallback();
			resolve();
		};
	} else {
		localWindow.onYouTubeIframeAPIReady = () => {
			resolve();
		};
	}
});

const addVideoStartedClass = (el: HTMLElement | null) => {
	if (el) {
		el.classList.add('youtube__video-started');
	}
};

let tcfData: TCFv2ConsentState | undefined = undefined;

interface ConsentState {
	framework: null | Framework;
	canTarget: boolean;
}

let consentState: ConsentState = {
	framework: null,
	canTarget: false,
};

let resolveInitialConsent: (f: Framework) => void;
const initialConsent = new Promise((resolve) => {
	resolveInitialConsent = resolve;
});
onConsentChange((cmpConsent) => {
	if (cmpConsent.ccpa) {
		consentState = {
			framework: 'ccpa',
			canTarget: !cmpConsent.ccpa.doNotSell,
		};
		resolveInitialConsent('ccpa');
	} else if (cmpConsent.aus) {
		consentState = {
			framework: 'aus',
			canTarget: cmpConsent.aus.personalisedAdvertising,
		};
		resolveInitialConsent('aus');
	} else {
		tcfData = cmpConsent.tcfv2;
		consentState = {
			framework: 'tcfv2',
			canTarget: tcfData
				? Object.values(tcfData.consents).every(Boolean)
				: false,
		};
		resolveInitialConsent('tcfv2');
	}
});

interface YTPlayerEvent extends Omit<Event, 'target'> {
	data: number;
	target: YT.Player;
}

const playerStates: Array<keyof typeof YT.PlayerState> = [
	'ENDED',
	'PLAYING',
	'PAUSED',
	'BUFFERING',
	'CUED',
];

interface Handlers {
	onPlayerReady: (event: YTPlayerEvent) => void;
	onPlayerStateChange: (event: YTPlayerEvent) => void;
}

const onPlayerStateChangeEvent = (
	event: YTPlayerEvent,
	handlers?: Handlers,
	el?: HTMLElement | null,
) => {
	if (el) {
		if (config.get('page.isDev')) {
			const state = window.YT.PlayerState[event.data];
			if (state) {
				console.log(`Player ${el.id} is ${state}`);
			}
		}

		// change class according to the current state
		// TODO: Fix this so we can add poster image.
		fastdom.mutate(() => {
			playerStates.forEach((status: keyof typeof YT.PlayerState) => {
				el.classList.toggle(
					`youtube__video-${status.toLocaleLowerCase()}`,
					event.data === window.YT.PlayerState[status],
				);
				const fcItem = el.closest('fc-item');
				if (fcItem) {
					fcItem.classList.toggle(
						`fc-item--has-video-main-media__${status.toLocaleLowerCase()}`,
						event.data === window.YT.PlayerState[status],
					);
				}
				addVideoStartedClass(el);
			});
		});
	}

	if (handlers && typeof handlers.onPlayerStateChange === 'function') {
		handlers.onPlayerStateChange(event);
	}
};

const onPlayerReadyEvent = (
	event: YTPlayerEvent,
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
	custParams.permutive = getPermutivePFPSegments();

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
	onReady: (event: YTPlayerEvent) => void,
	onStateChange: (event: YTPlayerEvent) => void,
	onError: (event: YTPlayerEvent) => void,
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

const hasPlayerStarted = (event: YTPlayerEvent) =>
	event.target.getCurrentTime() > 0;

const getPlayerIframe = (videoId: string) =>
	document.getElementById(`youtube-${videoId}`);

export const initYoutubePlayer = async (
	el: HTMLElement,
	handlers: Handlers,
	videoId: string,
): Promise<YT.Player> => {
	await loadScript(scriptSrc, {});
	await youtubeReady;
	await initialConsent;

	const onPlayerStateChange = (event: YTPlayerEvent) => {
		onPlayerStateChangeEvent(event, handlers, getPlayerIframe(videoId));
	};

	const onPlayerReady = (event: YTPlayerEvent) => {
		const iframe = getPlayerIframe(videoId);
		if (hasPlayerStarted(event)) {
			addVideoStartedClass(iframe);
		}
		onPlayerReadyEvent(event, handlers, iframe);
	};

	const onPlayerError = (event: YTPlayerEvent) => {
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
};

export const _ = { createAdsConfig };
