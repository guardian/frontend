/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import {
	getConsentFor as getConsentFor_,
	onConsentChange as onConsentChange_,
} from '@guardian/consent-management-platform';
import type { Callback } from '@guardian/consent-management-platform/dist/types';
import { _, a9 } from './a9';

const onConsentChange = onConsentChange_ as jest.MockedFunction<
	typeof onConsentChange_
>;
const getConsentFor = getConsentFor_ as jest.MockedFunction<
	typeof getConsentFor_
>;

const tcfv2WithConsentMock = (callback: Callback) =>
	callback({
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
			vendorConsents: { '5edf9a821dc4e95986b66df4': true },
			eventStatus: 'tcloaded',
			addtlConsent: '',
			gdprApplies: true,
			tcString: 'blablabla',
		},
		canTarget: true,
		framework: 'tcfv2',
	});

const CcpaWithConsentMock = (callback: Callback) =>
	callback({
		ccpa: { doNotSell: false },
		canTarget: true,
		framework: 'ccpa',
	});

jest.mock('../../../../../lib/raven');
jest.mock('../../dfp/Advert', () =>
	jest.fn().mockImplementation(() => ({ advert: jest.fn() })),
);

jest.mock('../slot-config', () => ({
	slots: jest.fn().mockImplementation(() => [
		{
			key: 'top-above-nav',
			sizes: [
				[970, 250],
				[728, 90],
			],
		},
	]),
}));

jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: jest.fn(),
	getConsentFor: jest.fn(),
}));

beforeEach(() => {
	jest.resetModules();
	_.resetModule();
	window.apstag = {
		init: jest.fn(),
		fetchBids: jest.fn().mockImplementation(() => Promise.resolve([])),
		setDisplayBids: jest.fn(),
	};
});

afterAll(() => {
	jest.resetAllMocks();
});

describe('initialise', () => {
	it('should generate initialise A9 library when TCFv2 consent has been given', () => {
		onConsentChange.mockImplementation(tcfv2WithConsentMock);
		getConsentFor.mockReturnValue(true);
		a9.initialise();
		expect(window.apstag).toBeDefined();
		expect(window.apstag?.init).toHaveBeenCalled();
	});

	it('should generate initialise A9 library when CCPA consent has been given', () => {
		onConsentChange.mockImplementation(CcpaWithConsentMock);
		getConsentFor.mockReturnValue(true);
		a9.initialise();
		expect(window.apstag).toBeDefined();
		expect(window.apstag?.init).toHaveBeenCalled();
	});
});
