// @flow
import { twitterUwt } from 'commercial/modules/third-party-tags/twitter-uwt';
import { getAdConsentState as _getAdConsentState } from 'common/modules/commercial/ad-prefs.lib';

const getAdConsentState: any = _getAdConsentState;

jest.mock('common/modules/commercial/ad-prefs.lib', () => ({
    getAdConsentState: jest.fn(),
}));

jest.mock('lib/config', () => ({ get: () => true }));

describe('twitterUwt', () => {
    afterEach(() => {
        getAdConsentState.mockReset();
    });

    it('shouldRun to be true if ad consent granted', () => {
        getAdConsentState.mockReturnValueOnce(true);

        const { shouldRun, url, onLoad } = twitterUwt();

        expect(shouldRun).toEqual(true);
        expect(url).toEqual('//static.ads-twitter.com/uwt.js');
        expect(onLoad).toBeDefined();
    });

    it('shouldRun to be false if ad consent not granted or denied', () => {
        getAdConsentState.mockReturnValueOnce(null);

        const { shouldRun, url, onLoad } = twitterUwt();

        expect(shouldRun).toEqual(false);
        expect(url).toEqual('//static.ads-twitter.com/uwt.js');
        expect(onLoad).toBeDefined();
    });

    it('shouldRun to be false if ad consent denied', () => {
        getAdConsentState.mockReturnValueOnce(false);

        const { shouldRun, url, onLoad } = twitterUwt();

        expect(shouldRun).toEqual(false);
        expect(url).toEqual('//static.ads-twitter.com/uwt.js');
        expect(onLoad).toBeDefined();
    });
});
