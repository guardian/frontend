import { getPermutivePFPSegments } from '@guardian/commercial-core';
import type {
	AdsConfigBasic,
	AdsConfigDisabled,
	AdsConfigEnabled,
	AdsConfigTCFV2,
	AdsConfigUSNATorAus,
} from '@guardian/commercial-core/dist/cjs/types';
import type { ConsentState } from '@guardian/libs';
import { loadScript, log, onConsentChange } from '@guardian/libs';
import fastdom from 'fastdom';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import config from 'lib/config';
import type { MaybeArray } from 'lib/url';
import { constructQuery } from 'lib/url';

interface WindowLocal extends Window {
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

let resolveInitialConsent: (consentState: ConsentState) => void;
const initialConsent = new Promise<ConsentState>((resolve) => {
	// We don’t need to wait for consent if Ad-Free
	if (commercialFeatures.adFree) {
		resolve({
			canTarget: false,
			framework: null,
		});
	}

	resolveInitialConsent = resolve;
});
onConsentChange((consentState) => {
	resolveInitialConsent(consentState);
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
			const playerState = window.YT.PlayerState[event.data];
			if (playerState) {
				console.log(`Player ${el.id} is ${playerState}`);
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

	handlers?.onPlayerStateChange(event);
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

	handlers?.onPlayerReady(event);
};

const createAdsConfigDisabled = (): AdsConfigDisabled => {
	const adFreeConfig: AdsConfigDisabled = { disableAds: true };
	log('commercial', 'YouTube Ad-Free Config', adFreeConfig);
	return adFreeConfig;
};

/**
 * TODO: Use buildAdsConfig from `@guardian/commercial-core`
 * @param consentState
 * @returns A valid YouTube ads config
 */
const createAdsConfigEnabled = (
	consentState: ConsentState,
): AdsConfigEnabled => {
	const custParams = getPageTargeting(consentState) as Record<
		string,
		MaybeArray<string>
	>;
	custParams.permutive = getPermutivePFPSegments();

	const adsConfigBasic: AdsConfigBasic = {
		adTagParameters: {
			iu: config.get<string>('page.adUnit', ''),
			cust_params: encodeURIComponent(constructQuery(custParams)),
		},
	};

	if (consentState.tcfv2) {
		const adsConfigTCFv2: AdsConfigTCFV2 = {
			adTagParameters: {
				...adsConfigBasic.adTagParameters,
				cmpGdpr: consentState.tcfv2.gdprApplies ? 1 : 0,
				cmpVcd: consentState.tcfv2.tcString,
				cmpGvcd: consentState.tcfv2.addtlConsent,
			},
			nonPersonalizedAd: !consentState.canTarget,
		};
		log('commercial', 'YouTube Ads Config TCFv2', adsConfigTCFv2);
		return adsConfigTCFv2;
	}

	if (consentState.usnat || consentState.aus) {
		const adsConfigUSNAT: AdsConfigUSNATorAus = {
			...adsConfigBasic,
			restrictedDataProcessor: !consentState.canTarget,
		};
		log('commercial', 'YouTube Ads Config CCPA/AUS', adsConfigUSNAT);
		return adsConfigUSNAT;
	}

	return adsConfigBasic;
};

/*eslint curly: ["error", "multi-line"] -- it’s safer to update */
type YTHost = 'https://www.youtube.com' | 'https://www.youtube-nocookie.com';
const getHost = ({
	consentState,
	classes,
	adFree,
}: {
	consentState: ConsentState;
	classes: string[];
	adFree: boolean;
}): YTHost => {
	if (
		consentState.canTarget &&
		!adFree &&
		classes.includes('youtube-media-atom__iframe')
	) {
		return 'https://www.youtube.com';
	}

	// Default to no-cookie
	return 'https://www.youtube-nocookie.com';
};

const setupPlayer = (
	el: HTMLElement,
	videoId: string,
	onReady: (event: YTPlayerEvent) => void,
	onStateChange: (event: YTPlayerEvent) => void,
	onError: (event: YTPlayerEvent) => void,
	consentState: ConsentState,
): YT.Player => {
	// relatedChannels needs to be an array, as per YouTube's IFrame Embed Config API
	const relatedChannels: string[] = [];
	/**
	 * There's an issue with relatedChannels where
	 * if we pass a populated array no related videos are
	 * shown. Therefore for the time being we will pass an
	 * empty array.
	 */

	const adsConfig = !commercialFeatures.youtubeAdvertising
		? createAdsConfigDisabled()
		: createAdsConfigEnabled(consentState);

	/**
	 * Note:
	 * This element id must be unique!
	 * Ensured via the SSR render of youtube.scala.html
	 */

	// @ts-expect-error -- ts is confused by multiple constructors
	return new window.YT.Player(el.id, {
		host: getHost({
			consentState,
			classes: [...el.classList.values()],
			adFree: commercialFeatures.adFree,
		}),
		videoId,
		width: '100%',
		height: '100%',
		events: {
			onReady,
			onStateChange,
			onError,
		},
		embedConfig: {
			relatedChannels,
			adsConfig,
		},
	});
};

const hasPlayerStarted = (event: YTPlayerEvent) =>
	event.target.getCurrentTime() > 0;

const getPlayerIframe = (id: string) => document.getElementById(id);

export const initYoutubePlayer = async (
	el: HTMLElement,
	handlers: Handlers,
	videoId: string,
): Promise<YT.Player> => {
	await loadScript(scriptSrc, {});
	await youtubeReady;
	const consentState = await initialConsent;

	const onPlayerStateChange = (event: YTPlayerEvent) => {
		onPlayerStateChangeEvent(event, handlers, getPlayerIframe(el.id));
	};

	const onPlayerReady = (event: YTPlayerEvent) => {
		const iframe = getPlayerIframe(el.id);
		if (hasPlayerStarted(event)) {
			addVideoStartedClass(iframe);
		}
		onPlayerReadyEvent(event, handlers, iframe);
	};

	const onPlayerError = (event: YTPlayerEvent) => {
		console.error(`YOUTUBE: ${event.data}`);
		console.dir(event);
	};

	return setupPlayer(
		el,
		videoId,
		onPlayerReady,
		onPlayerStateChange,
		onPlayerError,
		consentState,
	);
};

export const _ = {
	createAdsConfig: createAdsConfigEnabled,
	createAdFreeConfig: createAdsConfigDisabled,
	getHost,
};
