import {
	getConsentFor as getConsentFor_,
	onConsentChange as onConsentChange_,
} from '@guardian/consent-management-platform';
import type { CCPAConsentState } from '@guardian/consent-management-platform/dist/types/ccpa';
import type { TCFv2ConsentState } from '@guardian/consent-management-platform/dist/types/tcfv2';
import _config from '../../../../lib/config';
import { getBreakpoint as getBreakpoint_ } from '../../../../lib/detect';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { dfpEnv } from './dfp-env';
import { fillAdvertSlots as fillAdvertSlots_ } from './fill-advert-slots';
import { getAdverts } from './get-adverts';
import { getCreativeIDs } from './get-creative-ids';
import { loadAdvert } from './load-advert';
import { init as prepareGoogletag } from './prepare-googletag';

/*
Note: Real type can be found at @guardian/consent-management-platform/dist/types/tcfv2
Using a custom type here because our mock is not complete
 */
type AUSRejectedMockType = {
	aus: {
		rejectedCategories:
			| Array<{
					_id: string;
					name: string;
			  }>
			| never[];
	};
};

declare global {
	interface Window {
		__switch_zero: boolean;
	}
}

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

const onConsentChange = onConsentChange_ as jest.MockedFunction<
	(fn: any) => void
>;
const getConsentFor = getConsentFor_ as jest.MockedFunction<
	(vendor: string) => boolean
>;

// eslint-disable-next-line -- ESLint doesn't understand jest.requireActual
const actualFillAdvertSlots = jest.requireActual('./fill-advert-slots')
	.fillAdvertSlots as () => Promise<void | undefined>;

const getBreakpoint = getBreakpoint_ as jest.MockedFunction<
	(includeTweakpoint: boolean) => any
>;
const fillAdvertSlots = fillAdvertSlots_ as jest.MockedFunction<
	() => Promise<void | undefined>
>;

jest.mock('./fill-advert-slots', () => ({
	fillAdvertSlots: jest.fn(),
}));
jest.mock('../../../../lib/raven');
jest.mock('../../../common/modules/identity/api', () => ({
	isUserLoggedIn: () => true,
	getUserFromCookie: jest.fn(),
	getUserFromApi: jest.fn(),
	getUrl: jest.fn(),
}));
jest.mock('ophan/ng', () => null);
jest.mock('../../../common/modules/analytics/beacon', () => void {});
jest.mock('../../../../lib/detect', () => ({
	hasCrossedBreakpoint: jest.fn(),
	isBreakpoint: jest.fn(),
	getBreakpoint: jest.fn(),
	getViewport: jest.fn(),
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
jest.mock('@guardian/libs', () => {
	/* */
	return {
		loadScript: jest.fn(() => Promise.resolve()),
		// eslint-disable-next-line -- ESLint doesn't understand jest.requireActual
		log: jest.requireActual('@guardian/libs').log,
		// eslint-disable-next-line -- ESLint doesn't understand jest.requireActual
		storage: jest.requireActual('@guardian/libs').storage,
	};
});
jest.mock('lodash/once', () => (fn: () => any) => fn);
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
	onConsentChange: jest.fn(),
	getConsentFor: jest.fn(),
	cmp: {
		hasInitialised: jest.fn(),
		willShowPrivacySync: jest.fn(),
	},
}));

let $style: HTMLElement;
const makeFakeEvent = (creativeId: string, id: string) => ({
	creativeId,
	slot: {
		getSlotElementId() {
			return id;
		},
	},
	size: ['300', '250'],
});

const reset = () => {
	dfpEnv.advertIds = {};
	dfpEnv.adverts = [];
	dfpEnv.advertsToRefresh = [];
	dfpEnv.advertsToLoad = [];
	dfpEnv.hbImpl = { prebid: false, a9: false };
	fillAdvertSlots.mockReset();
};

const tcfv2WithConsent = {
	tcfv2: {
		consents: {
			'1': true,
			'2': true,
			'3': true,
			'4': true,
			'5': true,
		},
		vendorConsents: {
			'5f1aada6b8e05c306c0597d7': true, // Googletag
		},
	},
} as Partial<TCFv2ConsentState>;

const tcfv2WithoutConsent = {
	tcfv2: {
		consents: {
			'1': false,
			'2': false,
			'3': false,
			'4': false,
			'5': false,
		},
		vendorConsents: {
			'5f1aada6b8e05c306c0597d7': false, // Googletag
		},
	},
} as Partial<TCFv2ConsentState>;

// TODO: There is no null consent in the new CMP
const tcfv2NullConsent = {
	tcfv2: {
		consents: {
			'1': null,
			'2': null,
			'3': null,
			'4': null,
			'5': null,
		},
		vendorConsents: {
			'5f1aada6b8e05c306c0597d7': null, // Googletag
		},
	},
} as Partial<TCFv2ConsentState>;

const tcfv2MixedConsent = {
	tcfv2: {
		consents: {
			'1': true,
			'2': false,
			'3': false,
			'4': true,
			'5': false,
		},
		vendorConsents: {
			'5f1aada6b8e05c306c0597d7': true, // Googletag
		},
	},
} as Partial<TCFv2ConsentState>;

const ausNotRejected = {
	aus: {
		rejectedCategories: [],
	},
};

const ausRejected = {
	aus: {
		rejectedCategories: [
			{
				_id: '5f859c3420e4ec3e476c7006',
				name: 'Advertising',
			},
		],
	},
};

const ccpaWithConsent = { ccpa: { doNotSell: false } } as {
	ccpa: CCPAConsentState;
};

const ccpaWithoutConsent = { ccpa: { doNotSell: true } } as {
	ccpa: CCPAConsentState;
};

describe('DFP', () => {
	const domSnippet = `
        <div id="dfp-ad-html-slot" class="js-ad-slot" data-name="html-slot" data-mobile="300,50"></div>
        <div id="dfp-ad-script-slot" class="js-ad-slot" data-name="script-slot" data-mobile="300,50|320,50" data-refresh="false"></div>
        <div id="dfp-ad-already-labelled" class="js-ad-slot ad-label--showing" data-name="already-labelled" data-mobile="300,50|320,50"  data-tablet="728,90"></div>
        <div id="dfp-ad-dont-label" class="js-ad-slot" data-label="false" data-name="dont-label" data-mobile="300,50|320,50"  data-tablet="728,90" data-desktop="728,90|900,250|970,250"></div>
    `;

	let googleTag: googletag.Googletag;
	let googleSlot: googletag.Slot;
	let pubAds: googletag.PubAdsService;
	let sizeMapping: googletag.SizeMappingBuilder;

	const listeners: Record<
		string,
		(event: googletag.events.SlotRenderEndedEvent) => void
	> = {};

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

		config.set('ophan.pageViewId', 'dummyOphanPageViewId');

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

		sizeMapping = ({
			sizes: sizesArray,
			addSize: jest.fn((width, sizes) => {
				sizesArray.unshift([width, sizes]);
			}),
			build: jest.fn(() => {
				const tmp = sizesArray;
				sizesArray = [];
				return tmp;
			}),
		} as unknown) as googletag.SizeMappingBuilder;

		googleSlot = ({
			defineSizeMapping: jest.fn(() => googleSlot),
			setSafeFrameConfig: jest.fn(() => googleSlot),
			setTargeting: jest.fn(() => googleSlot),
			addService: jest.fn(() => googleSlot),
		} as unknown) as googletag.Slot;

		googleTag = ({
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
		} as unknown) as googletag.Googletag;

		window.googletag = googleTag;
		window.__switch_zero = false;

		commercialFeatures.dfpAdvertising = true;
	});

	afterEach(() => {
		reset();
		document.body.innerHTML = '';
		$style.remove();
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

	it('should get the slots', () =>
		new Promise((resolve) => {
			fillAdvertSlots.mockImplementation(() => {
				return actualFillAdvertSlots().then(resolve);
			});

			void prepareGoogletag();
		}).then(() => {
			expect(Object.keys(getAdverts(true)).length).toBe(4);
		}));

	it('should not get hidden ad slots', async () => {
		const adSlot: HTMLElement | null = document.querySelector(
			'.js-ad-slot',
		);
		if (adSlot) {
			adSlot.style.display = 'none';
		}

		await new Promise((resolve) => {
			fillAdvertSlots.mockImplementation(() => {
				return actualFillAdvertSlots().then(resolve);
			});

			void prepareGoogletag();
		});
		const slots = getAdverts(true);
		expect(Object.keys(slots).length).toBe(3);
		Object.keys(slots).forEach((slotId) => {
			expect(slotId).toBeTruthy();
			expect(slotId).not.toBe('dfp-ad-html-slot');
		});
	});

	it('should set listeners', () =>
		prepareGoogletag().then(() => {
			expect(pubAds.addEventListener).toHaveBeenCalledWith(
				'slotRenderEnded',
				expect.anything(),
			);
		}));

	it('should define slots', async () =>
		new Promise((resolve) => {
			fillAdvertSlots.mockImplementation(() => {
				return actualFillAdvertSlots().then(resolve);
			});

			void prepareGoogletag();
		}).then(() => {
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
				expect(window.googletag?.defineSlot).toHaveBeenCalledWith(
					'/123456/theguardian.com/front',
					data[1],
					data[0],
				);
				expect(googleSlot.addService).toHaveBeenCalledWith(pubAds);
				if (Array.isArray(data[2])) {
					data[2].forEach(
						(size: number[] | Array<number[] | number[][]>) => {
							expect(sizeMapping.addSize).toHaveBeenCalledWith(
								size[0],
								size[1],
							);
						},
					);
				}
				expect(googleSlot.defineSizeMapping).toHaveBeenCalledWith(
					data[2],
				);
				expect(googleSlot.setTargeting).toHaveBeenCalledWith(
					'slot',
					data[3],
				);
			});
		}));

	it('should display ads', async () => {
		config.set('page.hasPageSkin', true);
		getBreakpoint.mockReturnValue('wide');

		await new Promise((resolve) => {
			fillAdvertSlots.mockImplementation(() => {
				return actualFillAdvertSlots().then(resolve);
			});

			void prepareGoogletag();
		});
		expect(pubAds.enableSingleRequest).toHaveBeenCalled();
		expect(pubAds.collapseEmptyDivs).toHaveBeenCalled();
		expect(window.googletag?.enableServices).toHaveBeenCalled();
		expect(loadAdvert).toHaveBeenCalled();
	});

	it('should be able to create "out of page" ad slot', async () => {
		document
			.querySelector('.js-ad-slot')
			?.setAttribute('data-out-of-page', 'true');

		await new Promise((resolve) => {
			fillAdvertSlots.mockImplementation(() => {
				return actualFillAdvertSlots().then(resolve);
			});

			void prepareGoogletag();
		});
		expect(window.googletag?.defineOutOfPageSlot).toHaveBeenCalled();
	});

	it('should expose ads IDs', async () => {
		const fakeEventOne = (makeFakeEvent(
			'1',
			'dfp-ad-html-slot',
		) as unknown) as googletag.events.SlotRenderEndedEvent;
		const fakeEventTwo = (makeFakeEvent(
			'2',
			'dfp-ad-script-slot',
		) as unknown) as googletag.events.SlotRenderEndedEvent;

		await new Promise((resolve) => {
			fillAdvertSlots.mockImplementation(() => {
				return actualFillAdvertSlots().then(resolve);
			});

			void prepareGoogletag();
		});
		listeners.slotRenderEnded(fakeEventOne);
		listeners.slotRenderEnded(fakeEventTwo);
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
			onConsentChange.mockImplementation(
				(callback: (val: Partial<TCFv2ConsentState>) => void) =>
					callback(tcfv2WithConsent),
			);
			getConsentFor.mockReturnValue(true);
			await prepareGoogletag();
			expect(pubAds.setTargeting).toHaveBeenCalledWith('k', [
				'korea',
				'ukraine',
			]);
		});
	});

	describe('NPA flag is set correctly', () => {
		it('when full TCF consent was given', async () => {
			onConsentChange.mockImplementation(
				(callback: (val: Partial<TCFv2ConsentState>) => void) =>
					callback(tcfv2WithConsent),
			);
			getConsentFor.mockReturnValue(true);
			await prepareGoogletag();
			expect(pubAds.setRequestNonPersonalizedAds).toHaveBeenCalledWith(0);
		});
		it('when no TCF consent preferences were specified', async () => {
			onConsentChange.mockImplementation(
				(callback: (val: Partial<TCFv2ConsentState>) => void) =>
					callback(tcfv2NullConsent),
			);
			getConsentFor.mockReturnValue(true);
			await prepareGoogletag();
			expect(pubAds.setRequestNonPersonalizedAds).toHaveBeenCalledWith(0);
		});
		it('when full TCF consent was denied', async () => {
			onConsentChange.mockImplementation(
				(callback: (val: Partial<TCFv2ConsentState>) => void) =>
					callback(tcfv2WithoutConsent),
			);
			getConsentFor.mockReturnValue(false);
			await prepareGoogletag();
			expect(pubAds.setRequestNonPersonalizedAds).toHaveBeenCalledWith(1);
		});
		it('when only partial TCF consent was given', async () => {
			onConsentChange.mockImplementation(
				(callback: (val: Partial<TCFv2ConsentState>) => void) =>
					callback(tcfv2MixedConsent),
			);
			getConsentFor.mockReturnValue(false);
			await prepareGoogletag();
			expect(pubAds.setRequestNonPersonalizedAds).toHaveBeenCalledWith(1);
		});
	});
	describe('NPA flag in AUS', () => {
		it('when AUS has not retracted advertising consent', async () => {
			onConsentChange.mockImplementation(
				(callback: (val: AUSRejectedMockType) => void) =>
					callback(ausNotRejected),
			);
			getConsentFor.mockReturnValue(true);
			await prepareGoogletag();
			expect(pubAds.setRequestNonPersonalizedAds).toHaveBeenCalledWith(0);
		});
		it('when AUS has retracted advertising consent', async () => {
			onConsentChange.mockImplementation(
				(callback: (val: AUSRejectedMockType) => void) =>
					callback(ausRejected),
			);
			getConsentFor.mockReturnValue(false);
			await prepareGoogletag();
			expect(pubAds.setRequestNonPersonalizedAds).toHaveBeenCalledWith(1);
		});
	});
	describe('restrictDataProcessing flag is set correctly', () => {
		it('when CCPA consent was given', async () => {
			onConsentChange.mockImplementation(
				(callback: (val: { ccpa: CCPAConsentState }) => void) =>
					callback(ccpaWithConsent),
			);
			getConsentFor.mockReturnValue(true);
			await prepareGoogletag();
			expect(pubAds.setPrivacySettings).toHaveBeenCalledWith({
				restrictDataProcessing: false,
			});
		});
		it('when CCPA consent was denied', async () => {
			onConsentChange.mockImplementation(
				(callback: (val: { ccpa: CCPAConsentState }) => void) =>
					callback(ccpaWithoutConsent),
			);
			getConsentFor.mockReturnValue(false);
			await prepareGoogletag();
			expect(pubAds.setPrivacySettings).toHaveBeenCalledWith({
				restrictDataProcessing: true,
			});
		});
	});
});
