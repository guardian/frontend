import { cmp as cmp_ } from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import type { TCFv2ConsentState } from '@guardian/consent-management-platform/dist/types/tcfv2';
import { setCookie, storage } from '@guardian/libs';
import { getReferrer as getReferrer_ } from '../../../../lib/detect';
import { getCountryCode as getCountryCode_ } from '../../../../lib/geolocation';
import { getPrivacyFramework as getPrivacyFramework_ } from '../../../../lib/getPrivacyFramework';
import { getSynchronousParticipations as getSynchronousParticipations_ } from '../experiments/ab';
import { isUserLoggedIn as isUserLoggedIn_ } from '../identity/api';
import { getPageTargeting } from './build-page-targeting';
import { commercialFeatures } from './commercial-features';

const getSynchronousParticipations =
	getSynchronousParticipations_ as jest.MockedFunction<
		typeof getSynchronousParticipations_
	>;
const getReferrer = getReferrer_ as jest.MockedFunction<typeof getReferrer_>;
const isUserLoggedIn = isUserLoggedIn_ as jest.MockedFunction<
	typeof isUserLoggedIn_
>;
const getCountryCode = getCountryCode_ as jest.MockedFunction<
	typeof getCountryCode_
>;
const getPrivacyFramework = getPrivacyFramework_ as jest.MockedFunction<
	typeof getPrivacyFramework_
>;
const cmp = {
	hasInitialised: cmp_.hasInitialised as jest.MockedFunction<
		typeof cmp_.hasInitialised
	>,
	willShowPrivacyMessageSync:
		cmp_.willShowPrivacyMessageSync as jest.MockedFunction<
			typeof cmp_.willShowPrivacyMessageSync
		>,
};

type UnknownFunc = (...args: unknown[]) => unknown;

jest.mock('../../../../lib/config');
jest.mock('../../../../lib/detect', () => ({
	getReferrer: jest.fn(),
	hasPushStateSupport: jest.fn(),
}));
jest.mock('../../../../lib/geolocation', () => ({
	getCountryCode: jest.fn(),
}));
jest.mock('../../../../lib/getPrivacyFramework', () => ({
	getPrivacyFramework: jest.fn(),
}));
jest.mock('../identity/api', () => ({
	isUserLoggedIn: jest.fn(),
}));
jest.mock('../experiments/ab', () => ({
	getSynchronousParticipations: jest.fn(),
}));
jest.mock('lodash-es/once', () => (fn: UnknownFunc) => fn);
jest.mock('lodash-es/memoize', () => (fn: UnknownFunc) => fn);
jest.mock('./commercial-features', () => ({
	commercialFeatures() {
		// do nothing;
	},
}));
jest.mock('@guardian/consent-management-platform', () => ({
	cmp: {
		hasInitialised: jest.fn(),
		willShowPrivacyMessageSync: jest.fn(),
	},
}));

const mockViewport = (width: number, height: number): void => {
	Object.defineProperties(window, {
		innerWidth: {
			value: width,
		},
		innerHeight: {
			value: height,
		},
	});
};

// CCPA
const ccpaWithConsentMock: ConsentState = {
	ccpa: { doNotSell: false },
	canTarget: true,
	framework: 'ccpa',
};

const ccpaWithoutConsentMock: ConsentState = {
	ccpa: { doNotSell: true },
	canTarget: false,
	framework: 'ccpa',
};

// AUS
const ausWithConsentMock: ConsentState = {
	aus: { personalisedAdvertising: true },
	canTarget: true,
	framework: 'aus',
};

const ausWithoutConsentMock: ConsentState = {
	aus: { personalisedAdvertising: false },
	canTarget: false,
	framework: 'aus',
};

// TCFv2
const defaultState: TCFv2ConsentState = {
	consents: { 1: false },
	eventStatus: 'tcloaded',
	vendorConsents: { abc: false },
	addtlConsent: 'xyz',
	gdprApplies: true,
	tcString: 'YAAA',
};

const tcfv2WithConsentMock: ConsentState = {
	tcfv2: {
		...defaultState,
		consents: { '1': true, '2': true },
		eventStatus: 'useractioncomplete',
	},
	canTarget: true,
	framework: 'tcfv2',
};

const tcfv2WithoutConsentMock: ConsentState = {
	tcfv2: { ...defaultState, consents: {}, eventStatus: 'cmpuishown' },
	canTarget: false,
	framework: 'tcfv2',
};

const tcfv2NullConsentMock: ConsentState = {
	tcfv2: undefined,
	canTarget: false,
	framework: 'tcfv2',
};

const tcfv2MixedConsentMock: ConsentState = {
	tcfv2: {
		...defaultState,
		consents: { '1': false, '2': true },
		eventStatus: 'useractioncomplete',
	},
	canTarget: false,
	framework: 'tcfv2',
};

const emptyConsent: ConsentState = {
	canTarget: false,
	framework: null,
};

describe('Build Page Targeting', () => {
	beforeEach(() => {
		window.guardian.config.page = {
			authorIds: 'profile/gabrielle-chan',
			blogIds: 'a/blog',
			contentType: 'Video',
			edition: 'US',
			keywordIds:
				'uk-news/prince-charles-letters,uk/uk,uk/prince-charles',
			pageId: 'football/series/footballweekly',
			publication: 'The Observer',
			seriesId: 'film/series/filmweekly',
			sponsorshipType: 'advertisement-features',
			tones: 'News',
			videoDuration: 63,
			sharedAdTargeting: {
				bl: ['blog'],
				br: 'p',
				co: ['gabrielle-chan'],
				ct: 'video',
				edition: 'us',
				k: ['prince-charles-letters', 'uk/uk', 'prince-charles'],
				ob: 't',
				p: 'ng',
				se: ['filmweekly'],
				su: ['5'],
				tn: ['news'],
				url: '/football/series/footballweekly',
			},
			isSensitive: false,
			// isHosted: true,
			// isDev: true,
			// isFront: false,
			// ajaxUrl: '/dummy/',
			// hasPageSkin: false,
			// assetsPath: '/dummy/',
			// section: 'unknown',
			// pbIndexSites: [],
			// adUnit: 'none',
		} as unknown as PageConfig;
		window.guardian.config.ophan = { pageViewId: 'presetOphanPageViewId' };

		commercialFeatures.adFree = false;

		setCookie({ name: 'adtest', value: 'ng101' });

		getReferrer.mockReturnValue('');
		mockViewport(0, 0);

		isUserLoggedIn.mockReturnValue(true);

		getSynchronousParticipations.mockReturnValue({
			MtMaster: {
				variant: 'variantName',
			},
		});

		storage.local.setRaw('gu.alreadyVisited', String(0));

		getCountryCode.mockReturnValue('US');
		getPrivacyFramework.mockReturnValue({ ccpa: true });

		jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

		expect.hasAssertions();
	});

	afterEach(() => {
		jest.spyOn(global.Math, 'random').mockRestore();
		jest.resetAllMocks();
	});

	it('should exist', () => {
		expect(getPageTargeting).toBeDefined();
	});

	it('should build correct page targeting', () => {
		const pageTargeting = getPageTargeting(emptyConsent);

		expect(pageTargeting.sens).toBe('f');
		expect(pageTargeting.edition).toBe('us');
		expect(pageTargeting.ct).toBe('video');
		expect(pageTargeting.p).toBe('ng');
		expect(pageTargeting.su).toEqual(['5']);
		expect(pageTargeting.bp).toBe('mobile');
		expect(pageTargeting.at).toBe('ng101');
		expect(pageTargeting.si).toEqual('t');
		expect(pageTargeting.co).toEqual(['gabrielle-chan']);
		expect(pageTargeting.bl).toEqual(['blog']);
		expect(pageTargeting.tn).toEqual(['news']);
		expect(pageTargeting.vl).toEqual('90');
		expect(pageTargeting.pv).toEqual('presetOphanPageViewId');
		expect(pageTargeting.pa).toEqual('f');
		expect(pageTargeting.cc).toEqual('US');
		expect(pageTargeting.rp).toEqual('dotcom-platform');
	});

	it('should set correct personalized ad (pa) param', () => {
		expect(getPageTargeting(tcfv2WithConsentMock).pa).toBe('t');
		expect(getPageTargeting(tcfv2WithoutConsentMock).pa).toBe('f');
		expect(getPageTargeting(tcfv2NullConsentMock).pa).toBe('f');
		expect(getPageTargeting(tcfv2MixedConsentMock).pa).toBe('f');
		expect(getPageTargeting(ccpaWithConsentMock).pa).toBe('t');
		expect(getPageTargeting(ccpaWithoutConsentMock).pa).toBe('f');
	});

	it('Should correctly set the RDP flag (rdp) param', () => {
		expect(getPageTargeting(tcfv2WithoutConsentMock).rdp).toBe('na');
		expect(getPageTargeting(tcfv2NullConsentMock).rdp).toBe('na');
		expect(getPageTargeting(ccpaWithConsentMock).rdp).toBe('f');
		expect(getPageTargeting(ccpaWithoutConsentMock).rdp).toBe('t');
	});

	it('Should correctly set the TCFv2 (consent_tcfv2, cmp_interaction) params', () => {
		getPrivacyFramework.mockReturnValue({ tcfv2: true });

		expect(getPageTargeting(tcfv2WithConsentMock).consent_tcfv2).toBe('t');
		expect(getPageTargeting(tcfv2WithConsentMock).cmp_interaction).toBe(
			'useractioncomplete',
		);

		expect(getPageTargeting(tcfv2WithoutConsentMock).consent_tcfv2).toBe(
			'f',
		);
		expect(getPageTargeting(tcfv2WithoutConsentMock).cmp_interaction).toBe(
			'cmpuishown',
		);

		expect(getPageTargeting(tcfv2MixedConsentMock).consent_tcfv2).toBe('f');
		expect(getPageTargeting(tcfv2MixedConsentMock).cmp_interaction).toBe(
			'useractioncomplete',
		);
	});

	it('should set correct edition param', () => {
		expect(getPageTargeting(emptyConsent).edition).toBe('us');
	});

	it('should set correct se param', () => {
		expect(getPageTargeting(emptyConsent).se).toEqual(['filmweekly']);
	});

	it('should set correct k param', () => {
		expect(getPageTargeting(emptyConsent).k).toEqual([
			'prince-charles-letters',
			'uk/uk',
			'prince-charles',
		]);
	});

	it('should set correct ab param', () => {
		expect(getPageTargeting(emptyConsent).ab).toEqual([
			'MtMaster-variantName',
		]);
	});

	it('should set Observer flag for Observer content', () => {
		expect(getPageTargeting(emptyConsent).ob).toEqual('t');
	});

	it('should set correct branding param for paid content', () => {
		expect(getPageTargeting(emptyConsent).br).toEqual('p');
	});

	it('should not contain an ad-free targeting value', () => {
		expect(getPageTargeting(emptyConsent).af).toBeUndefined();
	});

	it('should remove empty values', () => {
		window.guardian.config.page = {
			// pageId should always be defined
			pageId: 'football/series/footballweekly',
		} as PageConfig;
		window.guardian.config.ophan = { pageViewId: '123456' };

		expect(getPageTargeting(emptyConsent)).toEqual({
			ab: ['MtMaster-variantName'],
			at: 'ng101',
			bp: 'mobile',
			cc: 'US',
			cmp_interaction: 'na',
			consent_tcfv2: 'na',
			dcre: 'f',
			fr: '0',
			inskin: 'f',
			pa: 'f',
			pv: '123456',
			rdp: 'na',
			rp: 'dotcom-platform',
			sens: 'f',
			si: 't',
			skinsize: 's',
			urlkw: ['footballweekly'],
		});
	});

	describe('Breakpoint targeting', () => {
		it('should set correct breakpoint targeting for a mobile device', () => {
			mockViewport(320, 0);
			expect(getPageTargeting(emptyConsent).bp).toEqual('mobile');
		});

		it('should set correct breakpoint targeting for a medium mobile device', () => {
			mockViewport(375, 0);
			expect(getPageTargeting(emptyConsent).bp).toEqual('mobile');
		});

		it('should set correct breakpoint targeting for a mobile device in landscape mode', () => {
			mockViewport(480, 0);
			expect(getPageTargeting(emptyConsent).bp).toEqual('mobile');
		});

		it('should set correct breakpoint targeting for a phablet device', () => {
			mockViewport(660, 0);
			expect(getPageTargeting(emptyConsent).bp).toEqual('tablet');
		});

		it('should set correct breakpoint targeting for a tablet device', () => {
			mockViewport(740, 0);
			expect(getPageTargeting(emptyConsent).bp).toEqual('tablet');
		});

		it('should set correct breakpoint targeting for a desktop device', () => {
			mockViewport(980, 0);
			expect(getPageTargeting(emptyConsent).bp).toEqual('desktop');
		});

		it('should set correct breakpoint targeting for a leftCol device', () => {
			mockViewport(1140, 0);
			expect(getPageTargeting(emptyConsent).bp).toEqual('desktop');
		});

		it('should set correct breakpoint targeting for a wide device', () => {
			mockViewport(1300, 0);
			expect(getPageTargeting(emptyConsent).bp).toEqual('desktop');
		});

		it('should set appNexusPageTargeting as flatten string', () => {
			mockViewport(1024, 0);
			getPageTargeting(emptyConsent);
			expect(window.guardian.config.page.appNexusPageTargeting).toEqual(
				'sens=f,pt1=/football/series/footballweekly,pt2=us,pt3=video,pt4=ng,pt5=prince-charles-letters,pt5=uk/uk,pt5=prince-charles,pt6=5,pt7=desktop,pt9=presetOphanPageViewId|gabrielle-chan|news',
			);
		});
	});

	describe('Build Page Targeting (ad-free)', () => {
		it('should set the ad-free param to t when enabled', () => {
			commercialFeatures.adFree = true;
			expect(getPageTargeting(emptyConsent).af).toBe('t');
		});
	});

	describe('Already visited frequency', () => {
		it('can pass a value of five or less', () => {
			storage.local.setRaw('gu.alreadyVisited', String(5));
			expect(getPageTargeting(emptyConsent).fr).toEqual('5');
		});

		it('between five and thirty, includes it in a bucket in the form "x-y"', () => {
			storage.local.setRaw('gu.alreadyVisited', String(18));
			expect(getPageTargeting(emptyConsent).fr).toEqual('16-19');
		});

		it('over thirty, includes it in the bucket "30plus"', () => {
			storage.local.setRaw('gu.alreadyVisited', String(300));
			expect(getPageTargeting(emptyConsent).fr).toEqual('30plus');
		});

		it('passes a value of 0 if the value is not stored', () => {
			storage.local.remove('gu.alreadyVisited');
			expect(getPageTargeting(emptyConsent).fr).toEqual('0');
		});

		it('passes a value of 0 if the number is invalid', () => {
			storage.local.setRaw('gu.alreadyVisited', 'not-a-number');
			expect(getPageTargeting(emptyConsent).fr).toEqual('0');
		});
	});

	describe('Referrer', () => {
		it('should set ref to Facebook', () => {
			getReferrer.mockReturnValue(
				'https://www.facebook.com/feel-the-force',
			);
			expect(getPageTargeting(emptyConsent).ref).toEqual('facebook');
		});

		it('should set ref to Twitter', () => {
			getReferrer.mockReturnValue(
				'https://t.co/you-must-unlearn-what-you-have-learned',
			);
			expect(getPageTargeting(emptyConsent).ref).toEqual('twitter');
		});

		it('should set ref to reddit', () => {
			getReferrer.mockReturnValue(
				'https://www.reddit.com/its-not-my-fault',
			);
			expect(getPageTargeting(emptyConsent).ref).toEqual('reddit');
		});

		it('should set ref to google', () => {
			getReferrer.mockReturnValue(
				'https://www.google.com/i-find-your-lack-of-faith-distrubing',
			);
			expect(getPageTargeting(emptyConsent).ref).toEqual('google');
		});

		it('should set ref empty string if referrer does not match', () => {
			getReferrer.mockReturnValue('https://theguardian.com');
			expect(getPageTargeting(emptyConsent).ref).toEqual(undefined);
		});
	});

	describe('URL Keywords', () => {
		it('should return correct keywords from pageId', () => {
			expect(getPageTargeting(emptyConsent).urlkw).toEqual([
				'footballweekly',
			]);
		});

		it('should extract multiple url keywords correctly', () => {
			window.guardian.config.page.pageId =
				'stage/2016/jul/26/harry-potter-cursed-child-review-palace-theatre-london';
			expect(getPageTargeting(emptyConsent).urlkw).toEqual([
				'harry',
				'potter',
				'cursed',
				'child',
				'review',
				'palace',
				'theatre',
				'london',
			]);
		});

		it('should get correct keywords when trailing slash is present', () => {
			window.guardian.config.page.pageId =
				'stage/2016/jul/26/harry-potter-cursed-child-review-palace-theatre-london/';
			expect(getPageTargeting(emptyConsent).urlkw).toEqual([
				'harry',
				'potter',
				'cursed',
				'child',
				'review',
				'palace',
				'theatre',
				'london',
			]);
		});
	});

	describe('inskin targeting', () => {
		it('should not allow inskin if cmp has not initialised', () => {
			cmp.hasInitialised.mockReturnValue(false);
			cmp.willShowPrivacyMessageSync.mockReturnValue(false);
			mockViewport(1920, 1080);
			expect(getPageTargeting(emptyConsent).inskin).toBe('f');
		});

		it('should not allow inskin if cmp will show a banner', () => {
			cmp.hasInitialised.mockReturnValue(true);
			cmp.willShowPrivacyMessageSync.mockReturnValue(true);
			mockViewport(1920, 1080);
			expect(getPageTargeting(emptyConsent).inskin).toBe('f');
		});
	});

	describe('skinsize targetting', () => {
		it.each([
			['s', 1280],
			['s', 1440],
			['s', 1559],
			['l', 1560],
			['l', 1561],
			['l', 1920],
			['l', 2560],
		])("should return '%s' if viewport width is %s", (expected, width) => {
			cmp.hasInitialised.mockReturnValue(true);
			cmp.willShowPrivacyMessageSync.mockReturnValue(false);
			mockViewport(width, 800);
			expect(getPageTargeting(emptyConsent).skinsize).toBe(expected);
		});

		it("should return 's' if vp does not have a width", () => {
			mockViewport(0, 0);
			expect(getPageTargeting(emptyConsent).skinsize).toBe('s');
		});
	});

	describe('ad manager group value', () => {
		const STORAGE_KEY = 'gu.adManagerGroup';
		it('if present in localstorage, use value from storage', () => {
			storage.local.setRaw(STORAGE_KEY, '10');
			expect(getPageTargeting(tcfv2WithConsentMock).amtgrp).toEqual('10');
			storage.local.remove(STORAGE_KEY);
		});

		it.each([
			[ccpaWithConsentMock, '9'],
			[ccpaWithoutConsentMock, '9'],

			[ausWithConsentMock, '9'],
			[ausWithoutConsentMock, '9'],

			[tcfv2WithConsentMock, '9'],
			[tcfv2WithoutConsentMock, undefined],
			[tcfv2MixedConsentMock, undefined],
			[tcfv2MixedConsentMock, undefined],
		])('Framework %p => amtgrp is %s', (consentState, value) => {
			storage.local.setRaw(STORAGE_KEY, '9');
			expect(getPageTargeting(consentState).amtgrp).toEqual(value);
			storage.local.remove(STORAGE_KEY);
		});

		it('if not present in localstorage, generate a random group 1-12, store in localstorage', () => {
			// restore Math.random for this test so we can assert the group value range is 1-12
			jest.spyOn(global.Math, 'random').mockRestore();
			const valueGenerated =
				getPageTargeting(tcfv2WithConsentMock).amtgrp;
			expect(valueGenerated).toBeDefined();
			expect(Number(valueGenerated)).toBeGreaterThanOrEqual(1);
			expect(Number(valueGenerated)).toBeLessThanOrEqual(12);
			const valueFromStorage = storage.local.getRaw(STORAGE_KEY);
			expect(valueFromStorage).toEqual(valueGenerated);
		});
	});
});
