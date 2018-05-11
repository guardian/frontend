// @flow
import { getCookie as getCookie_, addCookie as addCookie_ } from 'lib/cookies';
import {
    getProviderCookieName,
    setProviderState,
    getProviderState,
} from './ad-prefs.lib';

const getCookie: any = getCookie_;
const addCookie: any = addCookie_;

const foogleProviderCookieName = 'GU_PERSONALISED_ADS_FOOGLE';

jest.mock('lib/cookies', () => ({
    getCookie: jest.fn(() => null),
    addCookie: jest.fn(() => null),
}));

beforeEach(() => {
    addCookie.mockReset();
    getCookie.mockReset();
});

describe('getProviderCookieName', () => {
    it('should convert provider names to a full cookie name', () => {
        expect(getProviderCookieName('foogle')).toBe(
            'GU_PERSONALISED_ADS_FOOGLE'
        );
        expect(getProviderCookieName('foogle with spaces')).toBe(
            'GU_PERSONALISED_ADS_FOOGLE_WITH_SPACES'
        );
        expect(getProviderCookieName('foogle 性状 unicode')).toBe(
            'GU_PERSONALISED_ADS_FOOGLE__UNICODE'
        );
    });
});

describe('getProviderState', () => {
    it('should convert false & null cookies properly', () => {
        getCookie.mockImplementation(() => 'false');
        expect(getProviderState('foogle')).toBe(false);
        getCookie.mockImplementation(() => null);
        expect(getProviderState('foogle')).toBe(false);
    });
    it('should convert true cookies properly', () => {
        getCookie.mockImplementation(() => 'true');
        expect(getProviderState('foogle')).toBe(true);
    });
});

describe('setProviderState', () => {
    it('should set a full proper cookie', () => {
        setProviderState('foogle', true);
        expect(addCookie.mock.calls[0][0]).toMatch(foogleProviderCookieName);
        expect(addCookie.mock.calls[0][1]).toMatch('true');
        expect(addCookie.mock.calls[0][2]).toBeGreaterThanOrEqual(365 * 4);
        expect(addCookie.mock.calls[0][3]).toBe(true);
    });
    it('should set a false cookie', () => {
        setProviderState('foogle', false);
        expect(addCookie.mock.calls[0][1]).toMatch('false');
    });
});
