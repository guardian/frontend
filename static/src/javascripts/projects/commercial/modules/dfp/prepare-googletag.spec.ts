import type * as CommercialCore from '@guardian/commercial-core';
import {
	getConsentFor,
	onConsent,
} from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { loadScript } from '@guardian/libs';
import _config from '../../../../lib/config';
import { getBreakpoint as getBreakpoint_ } from '../../../../lib/detect';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import type { Advert } from './Advert';
import { dfpEnv } from './dfp-env';
import { fillAdvertSlots } from './fill-advert-slots';
import { getAdvertById } from './get-advert-by-id';
import { loadAdvert } from './load-advert';
import { init as prepareGoogletag } from './prepare-googletag';

type MockCommercialCore = {
	slotSizeMappings: Record<string, unknown>;
};

const config = _config as {
	get: (k: string) => string;
	set: (
		k: string,
		v:
			| boolean
			| string
			| Record<string, never>
			| {
					adUnit: string;
					contentType: string;
					edition: string;
					isFront: boolean;
					keywordIds: string;
					pageId: string;
					section: string;
					seriesId: string;
					sharedAdTargeting: {
						ct: string;
						edition: string;
						k: string[];
						se: string[];
					};
			  },
	) => void;
};

const getAdverts = (withEmpty: boolean) =>
	Object.keys(dfpEnv.advertIds).reduce(
		(advertsById: Record<string, Advert | null>, id) => {
			const advert = getAdvertById(id);
			// Do not return empty slots unless explicitly requested
			if (withEmpty || (advert && !advert.isEmpty)) {
				advertsById[id] = advert;
			}
			return advertsById;
		},
		{},
	);

const getCreativeIDs = () => dfpEnv.creativeIDs;

const getBreakpoint = getBreakpoint_ as jest.MockedFunction<
	typeof getBreakpoint_
>;

jest.mock('../../../../lib/raven');
jest.mock('../../../common/modules/identity/api', () => ({
	isUserLoggedIn: () => true,
	getUserFromCookie: jest.fn(),
	getUserIdentifiersFromApi: jest.fn(),
	getUrl: jest.fn(),
}));
jest.mock('ophan/ng', () => null);
jest.mock('../../../common/modules/analytics/beacon', () => void {});
jest.mock('../../../../lib/detect', () => ({
	hasCrossedBreakpoint: jest.fn(),
	isBreakpoint: jest.fn(),
	getBreakpoint: jest.fn(),
	getViewport: jest.fn(() => ({ width: 0, height: 0 })),
	hasPushStateSupport: jest.fn(),
	getReferrer: jest.fn(() => ''),
	breakpoints: [
		{
			name: 'mobile',
			isTweakpoint: false,
			width: 0,
		},
		{
			name: 'tablet',
			isTweakpoint: false,
			width: 740,
		},
		{
			name: 'desktop',
			isTweakpoint: false,
			width: 980,
		},
		{
			name: 'wide',
			isTweakpoint: false,
			width: 1300,
		},
	],
	isGoogleProxy: jest.fn(() => false),
}));
jest.mock('../../../common/modules/analytics/google', () => () => void {});
jest.mock('./display-lazy-ads', () => ({
	displayLazyAds: jest.fn(),
}));

jest.mock('../../../common/modules/commercial/commercial-features', () => ({
	commercialFeatures: {
		dfpAdvertising: true,
	},
}));
jest.mock('@guardian/commercial-core', (): MockCommercialCore => {
	const commercialCore: typeof CommercialCore = jest.requireActual(
		'@guardian/commercial-core',
	);
	const { createAdSize } = commercialCore;
	return {
		...commercialCore,
		slotSizeMappings: {
			'html-slot': {
				mobile: [Array.from(createAdSize(300, 50))],
			},
			'script-slot': {
				mobile: [
					Array.from(createAdSize(300, 50)),
					Array.from(createAdSize(320, 50)),
				],
			},
			'already-labelled': {
				mobile: [
					Array.from(createAdSize(300, 50)),
					Array.from(createAdSize(320, 50)),
				],
				tablet: [Array.from(createAdSize(728, 90))],
			},
			'dont-label': {
				mobile: [
					Array.from(createAdSize(300, 50)),
					Array.from(createAdSize(320, 50)),
				],
				tablet: [Array.from(createAdSize(728, 90))],
				desktop: [
					Array.from(createAdSize(728, 90)),
					Array.from(createAdSize(900, 250)),
					Array.from(createAdSize(970, 250)),
				],
			},
		},
	};
});
jest.mock('@guardian/libs', () => {
	return {
		// eslint-disable-next-line -- ESLint doesn't understand jest.requireActual
		...jest.requireActual<typeof import('@guardian/libs')>(
			'@guardian/libs',
		),
		loadScript: jest.fn(() => Promise.resolve()),
	};
});
jest.mock(
	'lodash-es/once',
	() =>
		<T>(fn: (...args: unknown[]) => T) =>
			fn,
);
jest.mock('./refresh-on-resize', () => ({
	refreshOnResize: jest.fn(),
}));
jest.mock('../../../common/modules/analytics/beacon', () => ({
	fire: jest.fn(),
}));
jest.mock('../sticky-mpu', () => ({
	stickyMpu: jest.fn(),
}));
jest.mock('../../../common/modules/onward/geo-most-popular', () => ({
	geoMostPopular: { render: jest.fn() },
}));
jest.mock('./load-advert', () => ({
	loadAdvert: jest.fn(),
}));
jest.mock('@guardian/consent-management-platform', () => ({
	onConsent: jest.fn(),
	getConsentFor: jest.fn(),
	cmp: {
		hasInitialised: jest.fn(),
		willShowPrivacySync: jest.fn(),
	},
}));
jest.mock('./prepare-prebid', () => ({
	setupPrebidOnce: jest
		.fn()
		.mockImplementation(() => Promise.resolve(undefined)),
}));

const mockOnConsent = (consentState: ConsentState) =>
	(onConsent as jest.Mock).mockReturnValueOnce(Promise.resolve(consentState));

const mockGetConsentFor = (hasConsent: boolean) =>
	(getConsentFor as jest.Mock).mockReturnValueOnce(hasConsent);

let $style: HTMLElement;
const makeFakeEvent = (
	creativeId: number,
	id: string,
): DeepPartial<googletag.events.SlotRenderEndedEvent> => ({
	creativeId,
	slot: {
		getSlotElementId() {
			return id;
		},
	},
	size: [300, 250],
});

const reset = () => {
	dfpEnv.advertIds = {};
	dfpEnv.adverts = [];
	dfpEnv.advertsToRefresh = [];
	dfpEnv.advertsToLoad = [];
	dfpEnv.hbImpl = { prebid: false, a9: false };
};

const tcfv2WithConsent: ConsentState = {
	tcfv2: {
		consents: {
			'1': true,
			'2': true,
			'3': true,
			'4': true,
			'5': true,
			'6': true,
			'7': true,
			'8': true,
			'9': true,
			'10': true,
		},
		vendorConsents: {
			'5f1aada6b8e05c306c0597d7': true, // Googletag
		},
		eventStatus: 'tcloaded',
		addtlConsent: 'unknown',
		gdprApplies: true,
		tcString: 'BOGUS.YAA',
	},
	canTarget: true,
	framework: 'tcfv2',
};

const ausNotRejected: ConsentState = {
	aus: { personalisedAdvertising: true },
	canTarget: true,
	framework: 'aus',
};

const ausRejected: ConsentState = {
	aus: { personalisedAdvertising: false },
	canTarget: false,
	framework: 'aus',
};

const ccpaWithConsent: ConsentState = {
	ccpa: { doNotSell: false },
	canTarget: true,
	framework: 'ccpa',
};

const ccpaWithoutConsent: ConsentState = {
	ccpa: { doNotSell: true },
	canTarget: false,
	framework: 'ccpa',
};

describe('DFP', () => {
	const domSnippet = `
        <div id="dfp-ad-html-slot" class="js-ad-slot" data-name="html-slot" data-mobile="300,50"></div>
        <div id="dfp-ad-script-slot" class="js-ad-slot" data-name="script-slot" data-mobile="300,50|320,50" data-refresh="false"></div>
        <div id="dfp-ad-already-labelled" class="js-ad-slot ad-label--showing" data-name="already-labelled" data-mobile="300,50|320,50"  data-tablet="728,90"></div>
        <div id="dfp-ad-dont-label" class="js-ad-slot" data-label="false" data-name="dont-label" data-mobile="300,50|320,50"  data-tablet="728,90" data-desktop="728,90|900,250|970,250"></div>
    `;

	let googleTag: typeof googletag;
	let googleSlot: googletag.Slot;
	let pubAds: googletag.PubAdsService;
	let sizeMapping: googletag.SizeMappingBuilder;

	const listeners: {
		impressionViewable?: (
			event: googletag.events.ImpressionViewableEvent,
		) => void;
		slotOnload?: (event: googletag.events.SlotOnloadEvent) => void;
		slotRenderEnded?: (
			event: googletag.events.SlotRenderEndedEvent,
		) => void;
		slotRequested?: (event: googletag.events.SlotRequestedEvent) => void;
		slotResponseReceived?: (
			event: googletag.events.SlotResponseReceived,
		) => void;
		slotVisibilityChanged?: (
			event: googletag.events.SlotVisibilityChangedEvent,
		) => void;
	} = {} as const;

	beforeEach(() => {
		config.set('switches.commercial', true);

		config.set('page', {
			adUnit: '/123456/theguardian.com/front',
			contentType: 'Article',
			edition: 'us',
			isFront: true,
			keywordIds: 'world/korea,world/ukraine',
			pageId: 'world/uk',
			section: 'news',
			seriesId: 'learning/series/happy-times',
			sharedAdTargeting: {
				ct: 'Article',
				edition: 'us',
				k: ['korea', 'ukraine'],
				se: ['happy-times'],
			},
		});

		config.set('images.commercial', {});

		document.body.innerHTML = domSnippet;

		$style = document.createElement('style');
		$style.innerHTML = `body:after{ content: "wide"}`;
		document.head.appendChild($style);

		pubAds = {
			listeners: listeners,
			// @ts-expect-error - it is a mock
			addEventListener: jest.fn((eventType, listener) => {
				listeners[eventType] = listener;
				return pubAds;
			}),
			setTargeting: jest.fn(),
			enableSingleRequest: jest.fn(),
			collapseEmptyDivs: jest.fn(),
			refresh: jest.fn(),
			setRequestNonPersonalizedAds: jest.fn(),
			setPrivacySettings: jest.fn(),
		};

		let sizesArray: googletag.SizeMappingArray = [];

		sizeMapping = {
			sizes: sizesArray,
			addSize: jest.fn((width, sizes) => {
				sizesArray.unshift([width, sizes]);
			}),
			build: jest.fn(() => {
				const tmp = sizesArray;
				sizesArray = [];
				return tmp;
			}),
		} as unknown as googletag.SizeMappingBuilder;

		googleSlot = {
			defineSizeMapping: jest.fn(() => googleSlot),
			setSafeFrameConfig: jest.fn(() => googleSlot),
			setTargeting: jest.fn(() => googleSlot),
			addService: jest.fn(() => googleSlot),
		} as unknown as googletag.Slot;

		googleTag = {
			cmd: {
				push(...args: Array<() => void>) {
					args.forEach((command) => {
						command();
					});
					return args.length;
				},
			},
			pubads() {
				return pubAds;
			},
			sizeMapping() {
				return sizeMapping;
			},
			defineSlot: jest.fn(() => googleSlot),
			defineOutOfPageSlot: jest.fn(() => googleSlot),
			enableServices: jest.fn(),
			display: jest.fn(),
		} as unknown as typeof googletag;

		window.googletag = googleTag;
		(
			window as unknown as {
				__switch_zero: boolean;
			}
		).__switch_zero = false;

		commercialFeatures.dfpAdvertising = true;
	});

	afterEach(() => {
		reset();
		document.body.innerHTML = '';
		$style.remove();
		// @ts-expect-error -- we’re removing it
		window.googletag = undefined;
	});

	it('should exist', () => {
		expect(prepareGoogletag).toBeDefined();
		expect(getAdverts).toBeDefined();
		expect(getCreativeIDs).toBeDefined();
	});

	it('hides all ad slots when all DFP advertising is disabled', async () => {
		commercialFeatures.dfpAdvertising = false;
		await prepareGoogletag();
		const remainingAdSlots = document.querySelectorAll('.js-ad-slot');
		expect(remainingAdSlots.length).toBe(0);
	});

	it('should get the slots', async () => {
		expect.hasAssertions();

		mockOnConsent(tcfv2WithConsent);
		mockGetConsentFor(true);

		await fillAdvertSlots();
		await prepareGoogletag();

		expect(Object.keys(getAdverts(true)).length).toBe(4);
	});

	it('should not get hidden ad slots', async () => {
		const adSlot = document.querySelector<HTMLElement>('.js-ad-slot');
		if (adSlot) {
			adSlot.style.display = 'none';
		}
		mockOnConsent(tcfv2WithConsent);
		mockGetConsentFor(true);

		await fillAdvertSlots();
		await prepareGoogletag();

		const slots = getAdverts(true);
		expect(Object.keys(slots).length).toBe(3);
		Object.keys(slots).forEach((slotId) => {
			expect(slotId).toBeTruthy();
			expect(slotId).not.toBe('dfp-ad-html-slot');
		});
	});

	it('should set listeners', async () => {
		mockOnConsent(tcfv2WithConsent);
		mockGetConsentFor(true);
		await prepareGoogletag();
		expect(pubAds.addEventListener).toHaveBeenCalledWith(
			'slotRenderEnded',
			expect.anything(),
		);
	});

	it('should define slots', async () => {
		expect.hasAssertions();

		mockOnConsent(tcfv2WithConsent);
		mockGetConsentFor(true);

		await fillAdvertSlots();
		await prepareGoogletag();

		[
			[
				'dfp-ad-html-slot',
				[[300, 50]],
				[[[0, 0], [[300, 50]]]],
				'html-slot',
			],
			[
				'dfp-ad-script-slot',
				[
					[300, 50],
					[320, 50],
				],
				[
					[
						[0, 0],
						[
							[300, 50],
							[320, 50],
						],
					],
				],
				'script-slot',
			],
			[
				'dfp-ad-already-labelled',
				[
					[728, 90],
					[300, 50],
					[320, 50],
				],
				[
					[[740, 0], [[728, 90]]],
					[
						[0, 0],
						[
							[300, 50],
							[320, 50],
						],
					],
				],
				'already-labelled',
			],
			[
				'dfp-ad-dont-label',
				[
					[728, 90],
					[900, 250],
					[970, 250],
					[300, 50],
					[320, 50],
				],
				[
					[
						[980, 0],
						[
							[728, 90],
							[900, 250],
							[970, 250],
						],
					],
					[[740, 0], [[728, 90]]],
					[
						[0, 0],
						[
							[300, 50],
							[320, 50],
						],
					],
				],
				'dont-label',
			],
		].forEach((data) => {
			expect(window.googletag.defineSlot).toHaveBeenCalledWith(
				'/123456/theguardian.com/front',
				data[1],
				data[0],
			);
			expect(googleSlot.addService).toHaveBeenCalledWith(pubAds);
			if (Array.isArray(data[2])) {
				data[2].forEach((size) => {
					expect(sizeMapping.addSize).toHaveBeenCalledWith(
						size[0],
						size[1],
					);
				});
			}
			expect(googleSlot.defineSizeMapping).toHaveBeenCalledWith(data[2]);
			expect(googleSlot.setTargeting).toHaveBeenCalledWith(
				'slot',
				data[3],
			);
		});
	});

	it('should display ads', async () => {
		config.set('page.hasPageSkin', true);
		getBreakpoint.mockReturnValue('wide');

		mockOnConsent(tcfv2WithConsent);
		mockGetConsentFor(true);

		await fillAdvertSlots();
		await prepareGoogletag();

		expect(pubAds.enableSingleRequest).toHaveBeenCalled();
		expect(pubAds.collapseEmptyDivs).toHaveBeenCalled();
		expect(window.googletag.enableServices).toHaveBeenCalled();
		expect(loadAdvert).toHaveBeenCalled();
	});

	it('should be able to create "out of page" ad slot', async () => {
		document
			.querySelector('.js-ad-slot')
			?.setAttribute('data-out-of-page', 'true');

		mockOnConsent(tcfv2WithConsent);
		mockGetConsentFor(true);

		await fillAdvertSlots();
		await prepareGoogletag();

		expect(window.googletag.defineOutOfPageSlot).toHaveBeenCalled();
	});

	it('should expose ads IDs', async () => {
		const fakeEventOne = makeFakeEvent(
			1,
			'dfp-ad-html-slot',
		) as googletag.events.SlotRenderEndedEvent;
		const fakeEventTwo = makeFakeEvent(
			2,
			'dfp-ad-script-slot',
		) as googletag.events.SlotRenderEndedEvent;

		mockOnConsent(tcfv2WithConsent);
		mockGetConsentFor(true);

		await fillAdvertSlots();
		await prepareGoogletag();

		listeners.slotRenderEnded?.(fakeEventOne);
		listeners.slotRenderEnded?.(fakeEventTwo);
		const result_4 = getCreativeIDs();
		expect(result_4.length).toBe(2);
		expect(result_4[0]).toEqual('1');
		expect(result_4[1]).toEqual('2');
	});

	describe('pageskin loading', () => {
		it('should lazy load ads when there is no pageskin', () => {
			config.set('page.hasPageSkin', false);
			expect(dfpEnv.shouldLazyLoad()).toBe(true);
		});

		it('should not lazy load ads when there is a pageskin', () => {
			config.set('page.hasPageSkin', true);
			expect(dfpEnv.shouldLazyLoad()).toBe(false);
		});
	});

	describe('keyword targeting', () => {
		it('should send page level keywords', async () => {
			mockOnConsent(tcfv2WithConsent);
			mockGetConsentFor(true);
			await prepareGoogletag();
			expect(pubAds.setTargeting).toHaveBeenCalledWith('k', [
				'korea',
				'ukraine',
			]);
		});
	});

	describe('NPA flag in AUS', () => {
		it('when AUS consent is given', async () => {
			mockOnConsent(ausNotRejected);
			mockGetConsentFor(true);
			await prepareGoogletag();
			expect(pubAds.setRequestNonPersonalizedAds).toHaveBeenCalledWith(0);
		});
		it('when AUS consent is NOT given', async () => {
			mockOnConsent(ausRejected);
			mockGetConsentFor(false);
			await prepareGoogletag();
			expect(pubAds.setRequestNonPersonalizedAds).toHaveBeenCalledWith(1);
		});
	});
	describe('restrictDataProcessing flag in CCPA', () => {
		it('when CCPA consent is given', async () => {
			mockOnConsent(ccpaWithConsent);
			mockGetConsentFor(true);
			await prepareGoogletag();
			expect(pubAds.setPrivacySettings).toHaveBeenCalledWith({
				restrictDataProcessing: false,
			});
		});
		it('when CCPA consent is denied', async () => {
			mockOnConsent(ccpaWithoutConsent);
			mockGetConsentFor(false);
			await prepareGoogletag();
			expect(pubAds.setPrivacySettings).toHaveBeenCalledWith({
				restrictDataProcessing: true,
			});
		});
	});
	describe('load googletag', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});
		it('TCFV2 does load googletag when consent is given', async () => {
			mockOnConsent(tcfv2WithConsent);
			mockGetConsentFor(true);
			await prepareGoogletag();
			expect(loadScript).toHaveBeenCalledTimes(1);
			expect(loadScript).toHaveBeenCalledWith(
				'//www.googletagservices.com/tag/js/gpt.js',
				{ async: false },
			);
		});
		it('TCFV2 does NOT load when consent is NOT given', async () => {
			mockOnConsent(tcfv2WithConsent);
			mockGetConsentFor(false);
			await prepareGoogletag();
			expect(loadScript).toHaveBeenCalledTimes(0);
		});
	});
});
