import { loadScript } from '@guardian/libs';
import {
	onConsentChange as onConsentChange_,
	getConsentFor as getConsentFor_,
} from '@guardian/consent-management-platform';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { init, _ } from './comscore';

const { setupComscore } = _;

jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: jest.fn(),
	getConsentFor: jest.fn(),
}));

const onConsentChange = onConsentChange_;
const getConsentFor = getConsentFor_;
const SOURCEPOINT_ID = '5efefe25b8e05c06542b2a77';

const tcfv2WithConsentMock = (callback) =>
	callback({
		tcfv2: {
			vendorConsents: {
				[SOURCEPOINT_ID]: true,
			},
		},
	});
const tcfv2WithoutConsentMock = (callback) =>
	callback({
		tcfv2: {
			vendorConsents: {
				[SOURCEPOINT_ID]: false,
			},
		},
	});
const ccpaWithConsentMock = (callback) =>
	callback({
		ccpa: {
			doNotSell: false,
		},
	});
const ccpaWithoutConsentMock = (callback) =>
	callback({
		ccpa: {
			doNotSell: true,
		},
	});

const AusWithoutConsentMock = (callback) =>
	callback({
		aus: {
			doNotSell: true,
		},
	});

const AusWithConsentMock = (callback) =>
	callback({
		aus: {
			doNotSell: false,
		},
	});

jest.mock('@guardian/libs', () => {
	return {
		// eslint-disable-next-line -- ESLint doesn't understand jest.requireActual
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
	it('should do nothing if the comscore is disabled in commercial features', () => {
		commercialFeatures.comscore = false;
		setupComscore();

		expect(onConsentChange).not.toBeCalled();
	});

	it('should register a callback with onConsentChange if enabled in commercial features', () => {
		commercialFeatures.comscore = true;
		setupComscore();

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
