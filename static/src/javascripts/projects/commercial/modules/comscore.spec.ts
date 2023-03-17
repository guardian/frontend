/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import {
	getConsentFor,
	onConsent,
} from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import type { TCFv2ConsentState } from '@guardian/consent-management-platform/dist/types/tcfv2';
import { loadScript } from '@guardian/libs';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { _ } from './comscore';

const { setupComscore } = _;

jest.mock('@guardian/consent-management-platform');

const SOURCEPOINT_ID = '5efefe25b8e05c06542b2a77';

const defaultTCFv2State = {
	consents: { 1: false },
	eventStatus: 'tcloaded',
	vendorConsents: { abc: false },
	addtlConsent: 'xyz',
	gdprApplies: true,
	tcString: 'YAAA',
} as TCFv2ConsentState;

const tcfv2WithConsent = {
	tcfv2: {
		...defaultTCFv2State,
		vendorConsents: {
			[SOURCEPOINT_ID]: true,
		},
	},
	canTarget: true,
	framework: 'tcfv2',
} as ConsentState;

const tcfv2WithoutConsent = {
	tcfv2: {
		...defaultTCFv2State,
		vendorConsents: {
			[SOURCEPOINT_ID]: false,
		},
	},
	canTarget: false,
	framework: 'tcfv2',
} as ConsentState;

const ccpaWithConsent = {
	ccpa: {
		doNotSell: false,
	},
	canTarget: true,
	framework: 'ccpa',
} as ConsentState;

const ccpaWithoutConsent = {
	ccpa: {
		doNotSell: true,
	},
	canTarget: false,
	framework: 'ccpa',
} as ConsentState;

const AusWithoutConsent = {
	aus: {
		personalisedAdvertising: false,
	},
	canTarget: true,
	framework: 'aus',
} as ConsentState;

const AusWithConsent = {
	aus: {
		personalisedAdvertising: true,
	},
	canTarget: false,
	framework: 'aus',
} as ConsentState;

jest.mock('@guardian/libs', () => ({
	loadScript: jest.fn(() => Promise.resolve()),
	log: jest.fn(),
}));

jest.mock('../../common/modules/commercial/commercial-features', () => ({
	commercialFeatures: {
		comscore: true,
	},
}));

const mockOnConsent = (consentState: ConsentState) =>
	(onConsent as jest.Mock).mockReturnValueOnce(Promise.resolve(consentState));

const mockGetConsentFor = (hasConsent: boolean) =>
	(getConsentFor as jest.Mock).mockReturnValueOnce(hasConsent);

describe('setupComscore', () => {
	it('should do nothing if the comscore is disabled in commercial features', async () => {
		commercialFeatures.comscore = false;
		await setupComscore();
		expect(onConsent).not.toBeCalled();
	});

	it('should register a callback with onConsentChange if enabled in commercial features', async () => {
		mockOnConsent(tcfv2WithConsent);
		commercialFeatures.comscore = true;
		await setupComscore();
		expect(onConsent).toBeCalled();
	});

	describe('Framework consent: running on consent', () => {
		beforeEach(() => {
			jest.resetAllMocks();
		});

		it('TCFv2 with consent: runs', async () => {
			mockOnConsent(tcfv2WithConsent);
			mockGetConsentFor(true);
			await setupComscore();
			expect(loadScript).toBeCalled();
		});

		it('TCFv2 without consent: does not run', async () => {
			mockOnConsent(tcfv2WithoutConsent);
			mockGetConsentFor(false);
			await setupComscore();
			expect(loadScript).not.toBeCalled();
		});
		it('CCPA with consent: runs', async () => {
			mockOnConsent(ccpaWithConsent);
			await setupComscore();
			expect(loadScript).toBeCalled();
		});

		it('CCPA without consent: does not run', async () => {
			mockOnConsent(ccpaWithoutConsent);
			await setupComscore();
			expect(loadScript).not.toBeCalled();
		});

		it('Aus without consent: runs', async () => {
			mockOnConsent(AusWithoutConsent);
			await setupComscore();
			expect(loadScript).toBeCalled();
		});

		it('Aus with consent: runs', async () => {
			mockOnConsent(AusWithConsent);
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
