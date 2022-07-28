import {
	getCookie as getCookie_,
	addCookie as addCookie_,
} from '../../../../lib/cookies';
import { setAdConsentState, getAdConsentState } from './ad-prefs.lib';

const getCookie = getCookie_;
const addCookie = addCookie_;

const testConsent = {
	label: 'Test consent',
	cookie: 'GU_AD_CONSENT_TEST',
};

jest.mock('../../../../lib/cookies', () => ({
	getCookie: jest.fn(() => null),
	addCookie: jest.fn(() => null),
}));

jest.mock('../analytics/send-privacy-prefs', () => ({
	onConsentSet: jest.fn(() => null),
}));

beforeEach(() => {
	addCookie.mockReset();
	getCookie.mockReset();
});

describe('getAdConsentState', () => {
	it('should convert false & true cookies properly', () => {
		getCookie.mockImplementation(() => '0');
		expect(getAdConsentState(testConsent)).toBe(false);
		getCookie.mockImplementation(() => '1');
		expect(getAdConsentState(testConsent)).toBe(true);
	});
	it('should convert null & inconsistent cookies properly', () => {
		getCookie.mockImplementation(() => null);
		expect(getAdConsentState(testConsent)).toBe(null);
		getCookie.mockImplementation(() => 'verdadero');
		expect(getAdConsentState(testConsent)).toBe(null);
	});
});

describe('setAdConsentState', () => {
	it('should set a full proper cookie', () => {
		setAdConsentState(testConsent, true);
		expect(addCookie.mock.calls[0][0]).toBe('GU_AD_CONSENT_TEST');
		expect(addCookie.mock.calls[0][1]).toMatch('1.');
		expect(addCookie.mock.calls[0][2]).toBe(30 * 18);
		expect(addCookie.mock.calls[0][3]).toBe(true);
	});
	it('should set a false cookie', () => {
		setAdConsentState(testConsent, false);
		expect(addCookie.mock.calls[0][1]).toMatch('0.');
	});
});
