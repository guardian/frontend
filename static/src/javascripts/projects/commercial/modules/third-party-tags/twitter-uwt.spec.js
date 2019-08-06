// @flow
import { twitterUwt } from 'commercial/modules/third-party-tags/twitter-uwt';
import { getAdConsentState as _getAdConsentState } from 'common/modules/commercial/ad-prefs.lib';

const getAdConsentState: any = _getAdConsentState;

jest.mock('common/modules/commercial/ad-prefs.lib', () => ({
    getAdConsentState: jest.fn(),
}));

/**
 * we have to mock config like this because
 * loading twitterUwt has side affects
 * that are dependent on config.
 * */
jest.mock('lib/config', () => {
    const defaultConfig = {
        switches: {
            twitterUwt: true,
        },
    };

    return Object.assign({}, defaultConfig, {
        get: (path: string = '', defaultValue: any) =>
            path
                .replace(/\[(.+?)\]/g, '.$1')
                .split('.')
                .reduce((o, key) => o[key], defaultConfig) || defaultValue,
    });
});

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

    it('shouldRun to be false if ad consent not granted', () => {
        getAdConsentState.mockReturnValueOnce(false);

        const { shouldRun, url, onLoad } = twitterUwt();

        expect(shouldRun).toEqual(false);
        expect(url).toEqual('//static.ads-twitter.com/uwt.js');
        expect(onLoad).toBeDefined();
    });
});
