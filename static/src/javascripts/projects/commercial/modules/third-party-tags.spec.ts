import type { ThirdPartyTag } from '@guardian/commercial/core';
import {
	getConsentFor,
	onConsent,
} from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { _, init } from './third-party-tags';

const { insertScripts, loadOther } = _;

jest.mock('../../../lib/raven');

jest.mock('@guardian/consent-management-platform');

const tcfv2AllConsent = {
	tcfv2: {
		consents: {
			1: true,
			2: true,
			3: true,
			4: true,
			5: true,
			6: true,
			7: true,
			8: true,
			9: true,
			10: true,
		},
		vendorConsents: { 100: true, 200: true, 300: true },
		eventStatus: 'tcloaded',
		addtlConsent: '',
		gdprApplies: true,
		tcString: 'blablabla',
	},
	canTarget: true,
	framework: 'tcfv2',
} as ConsentState;

const tcfv2WithConsent = {
	tcfv2: {
		consents: {
			1: true,
			2: false,
			3: false,
			4: false,
			5: false,
			6: false,
			7: true,
			8: true,
			9: false,
			10: false,
		},
		vendorConsents: { 100: true, 200: false, 300: false },
		eventStatus: 'tcloaded',
		addtlConsent: '',
		gdprApplies: true,
		tcString: 'blablabla',
	},
	canTarget: false,
	framework: 'tcfv2',
} as ConsentState;

const tcfv2WithoutConsent = {
	tcfv2: {
		consents: {
			1: false,
			2: false,
			3: false,
			4: false,
			5: false,
			6: false,
			7: false,
			8: false,
			9: false,
			10: false,
		},
		vendorConsents: { 100: false, 200: false, 300: false },
		eventStatus: 'tcloaded',
		addtlConsent: '',
		gdprApplies: true,
		tcString: 'blablabla',
	},
	canTarget: false,
	framework: 'tcfv2',
} as ConsentState;

beforeEach(() => {
	const firstScript = document.createElement('script');
	document.body.appendChild(firstScript);
	expect.hasAssertions();
});

afterEach(() => {
	document.body.innerHTML = '';
});

jest.mock('ophan/ng', () => null);

jest.mock('../../common/modules/commercial/commercial-features', () => ({
	commercialFeatures: {
		thirdPartyTags: true,
	},
}));

jest.mock('./third-party-tags/imr-worldwide', () => ({
	imrWorldwide: {
		shouldRun: true,
		url: '//fakeThirdPartyTag.js',
		onLoad: jest.fn(),
	},
}));

const mockOnConsent = (consentState: ConsentState) =>
	(onConsent as jest.Mock).mockReturnValueOnce(Promise.resolve(consentState));

const mockGetConsentFor = (hasConsent: boolean) =>
	(getConsentFor as jest.Mock).mockReturnValueOnce(hasConsent);

describe('third party tags', () => {
	it('should exist', () => {
		expect(init).toBeDefined();
		expect(loadOther).toBeDefined();
		expect(insertScripts).toBeDefined();
	});

	it('should not run if disabled in commercial features', (done) => {
		mockOnConsent(tcfv2AllConsent);
		commercialFeatures.thirdPartyTags = false;
		init()
			.then((enabled) => {
				expect(enabled).toBe(false);
				done();
			})
			.catch(() => {
				done.fail('third-party tags failed');
			});
	});

	it('should run if commercial enabled', (done) => {
		mockOnConsent(tcfv2AllConsent);
		commercialFeatures.thirdPartyTags = true;
		commercialFeatures.adFree = false;
		init()
			.then((enabled) => {
				expect(enabled).toBe(true);
				done();
			})
			.catch(() => {
				done.fail('init failed');
			});
	});

	describe('insertScripts', () => {
		const fakeThirdPartyAdvertisingTag: ThirdPartyTag = {
			shouldRun: true,
			url: '//fakeThirdPartyAdvertisingTag.js',
			onLoad: jest.fn(),
			name: 'permutive',
		};
		const fakeThirdPartyAdvertisingTag2: ThirdPartyTag = {
			shouldRun: true,
			url: '//fakeThirdPartyAdvertisingTag2.js',
			onLoad: jest.fn(),
			name: 'inizio',
		};
		const fakeThirdPartyPerformanceTag: ThirdPartyTag = {
			shouldRun: true,
			url: '//fakeThirdPartyPerformanceTag.js',
			onLoad: jest.fn(),
			name: 'twitter',
		};

		beforeEach(() => {
			fakeThirdPartyAdvertisingTag.loaded = undefined;
			fakeThirdPartyAdvertisingTag2.loaded = undefined;
			fakeThirdPartyPerformanceTag.loaded = undefined;
		});

		it('should add scripts to the document when TCFv2 consent has been given', async () => {
			mockOnConsent(tcfv2AllConsent);
			mockGetConsentFor(true);
			await insertScripts(
				[fakeThirdPartyAdvertisingTag],
				[fakeThirdPartyPerformanceTag],
			);
			expect(document.scripts.length).toBe(3);
		});

		it('should only add performance scripts to the document when TCFv2 consent has not been given', async () => {
			mockOnConsent(tcfv2WithoutConsent);
			mockGetConsentFor(false);
			await insertScripts(
				[fakeThirdPartyAdvertisingTag],
				[fakeThirdPartyPerformanceTag],
			);
			expect(document.scripts.length).toBe(2);
		});
		it('should add scripts to the document when CCPA consent has been given', async () => {
			mockOnConsent({
				ccpa: { doNotSell: false },
				canTarget: true,
				framework: 'ccpa',
			});
			mockGetConsentFor(true);
			await insertScripts(
				[fakeThirdPartyAdvertisingTag],
				[fakeThirdPartyPerformanceTag],
			);
			expect(document.scripts.length).toBe(3);
		});
		it('should only add performance scripts to the document when CCPA consent has not been given', async () => {
			mockOnConsent({
				ccpa: { doNotSell: true },
				canTarget: false,
				framework: 'ccpa',
			});
			mockGetConsentFor(false);
			await insertScripts(
				[fakeThirdPartyAdvertisingTag],
				[fakeThirdPartyPerformanceTag],
			);
			expect(document.scripts.length).toBe(2);
		});

		it('should only add consented custom vendors to the document for TCFv2', async () => {
			mockOnConsent(tcfv2WithConsent);
			mockGetConsentFor(true);
			mockGetConsentFor(false);
			await insertScripts(
				[fakeThirdPartyAdvertisingTag, fakeThirdPartyAdvertisingTag2],
				[],
			);
			expect(document.scripts.length).toBe(2);
		});

		it('should not add already loaded tags ', async () => {
			mockOnConsent(tcfv2WithConsent);
			mockGetConsentFor(true);
			mockGetConsentFor(false);
			mockOnConsent(tcfv2WithoutConsent);
			mockGetConsentFor(false);
			await insertScripts(
				[fakeThirdPartyAdvertisingTag, fakeThirdPartyAdvertisingTag2],
				[],
			);
			await insertScripts(
				[fakeThirdPartyAdvertisingTag, fakeThirdPartyAdvertisingTag2],
				[],
			);
			expect(document.scripts.length).toBe(2);
		});

		it('should not add scripts to the document when TCFv2 consent has not been given', async () => {
			mockOnConsent(tcfv2WithoutConsent);
			mockGetConsentFor(false);
			await insertScripts(
				[fakeThirdPartyAdvertisingTag, fakeThirdPartyAdvertisingTag2],
				[],
			);
			expect(document.scripts.length).toBe(1);
		});
	});
});
