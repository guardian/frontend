import {
	getConsentFor as getConsentFor_,
	onConsentChange as onConsentChange_,
} from '@guardian/consent-management-platform';
import type { Callback } from '@guardian/consent-management-platform/dist/types';
import type { TCFv2ConsentState } from '@guardian/consent-management-platform/dist/types/tcfv2';
import { loadScript } from '@guardian/libs';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { _ } from './comscore';

const { setupComscore } = _;

jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: jest.fn(),
	getConsentFor: jest.fn(),
}));

const onConsentChange = onConsentChange_ as jest.MockedFunction<
	typeof onConsentChange_
>;
const getConsentFor = getConsentFor_ as jest.MockedFunction<
	typeof getConsentFor_
>;

const SOURCEPOINT_ID = '5efefe25b8e05c06542b2a77';
const defaultTCFv2State: TCFv2ConsentState = {
	consents: { 1: false },
	eventStatus: 'tcloaded',
	vendorConsents: { abc: false },
	addtlConsent: 'xyz',
	gdprApplies: true,
	tcString: 'YAAA',
};

const tcfv2WithConsentMock = (callback: Callback): void =>
	callback({
		tcfv2: {
			...defaultTCFv2State,
			vendorConsents: {
				[SOURCEPOINT_ID]: true,
			},
		},
		canTarget: true,
		framework: "tcfv2"
	});
const tcfv2WithoutConsentMock = (callback: Callback) =>
	callback({
		tcfv2: {
			...defaultTCFv2State,
			vendorConsents: {
				[SOURCEPOINT_ID]: false,
			},
		},
		canTarget: false,
		framework: "tcfv2"
	});
const ccpaWithConsentMock = (callback: Callback) =>
	callback({
		ccpa: {
			doNotSell: false,
		},
		canTarget: true,
		framework: "ccpa"
	});
const ccpaWithoutConsentMock = (callback: Callback) =>
	callback({
		ccpa: {
			doNotSell: true,
		},
		canTarget: false,
		framework: "ccpa"
	});

const AusWithoutConsentMock = (callback: Callback) =>
	callback({
		aus: {
			personalisedAdvertising: false,
		},
		canTarget: true,
		framework: "aus"
	});

const AusWithConsentMock = (callback: Callback) =>
	callback({
		aus: {
			personalisedAdvertising: true,
		},
		canTarget: false,
		framework: "aus"
	});

jest.mock('@guardian/libs', () => {
	return {
		...jest.requireActual('@guardian/libs'),
		loadScript: jest.fn(() => Promise.resolve()),
	};
});
jest.mock('../../common/modules/commercial/commercial-features', () => ({
	commercialFeatures: {
		comscore: true,
	},
}));

describe('setupComscore', () => {
	it('should do nothing if the comscore is disabled in commercial features', async () => {
		commercialFeatures.comscore = false;
		await setupComscore();
		expect(onConsentChange).not.toBeCalled();
	});

	it('should register a callback with onConsentChange if enabled in commercial features', async () => {
		onConsentChange.mockImplementation(tcfv2WithConsentMock);
		commercialFeatures.comscore = true;
		await setupComscore();
		expect(onConsentChange).toBeCalled();
	});

	describe('Framework consent: running on consent', () => {
		beforeEach(() => {
			jest.resetAllMocks();
		});

		it('TCFv2 with consent: runs', async () => {
			onConsentChange.mockImplementation(tcfv2WithConsentMock);
			getConsentFor.mockReturnValue(true);
			await setupComscore();
			expect(loadScript).toBeCalled();
		});

		it('TCFv2 without consent: does not run', async () => {
			onConsentChange.mockImplementation(tcfv2WithoutConsentMock);
			getConsentFor.mockReturnValue(false);
			await setupComscore();
			expect(loadScript).not.toBeCalled();
		});
		it('CCPA with consent: runs', async () => {
			onConsentChange.mockImplementation(ccpaWithConsentMock);
			await setupComscore();
			expect(loadScript).toBeCalled();
		});

		it('CCPA without consent: does not run', async () => {
			onConsentChange.mockImplementation(ccpaWithoutConsentMock);
			await setupComscore();
			expect(loadScript).not.toBeCalled();
		});

		it('Aus without consent: runs', async () => {
			onConsentChange.mockImplementation(AusWithoutConsentMock);
			await setupComscore();
			expect(loadScript).toBeCalled();
		});

		it('Aus with consent: runs', async () => {
			onConsentChange.mockImplementation(AusWithConsentMock);
			await setupComscore();
			expect(loadScript).toBeCalled();
		});
	});
});

describe('comscore getGlobals', () => {
	it('return an object with the c1 and c2 properties correctly set when called with "Network Front" as keywords', () => {
		const expectedGlobals = { c1: _.comscoreC1, c2: _.comscoreC2 };
		expect(_.getGlobals('Network Front')).toMatchObject(expectedGlobals);
	});

	it('return an object with the c1 and c2 properties correctly set when called with non-"Network Front" as keywords', () => {
		const expectedGlobals = { c1: _.comscoreC1, c2: _.comscoreC2 };
		expect(_.getGlobals('')).toMatchObject(expectedGlobals);
	});

	it('returns an object with no comscorekw variable set when called with "Network Front" as keywords', () => {
		const comscoreGlobals = Object.keys(_.getGlobals('Network Front'));
		expect(comscoreGlobals).not.toContain('comscorekw');
	});

	it('returns an object with the correct comscorekw variable set when called with "Network Front" as keywords', () => {
		const keywords = 'These are the best keywords. The greatest!';

		expect(_.getGlobals(keywords)).toMatchObject({
			comscorekw: keywords,
		});
	});

	it('returns an object with the correct cs_ucfr variable set when calleed with consent sate as true', () => {
		expect(_.getGlobals('')).toMatchObject({
			cs_ucfr: '1',
		});
	});
});
