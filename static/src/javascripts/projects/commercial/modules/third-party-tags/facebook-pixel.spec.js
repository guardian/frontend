// @flow
import { getAdConsentState as _getAdConsentState } from 'common/modules/commercial/ad-prefs.lib';
import config from 'lib/config';

import { fbPixel } from 'commercial/modules/third-party-tags/facebook-pixel';

const getAdConsentState: any = _getAdConsentState;

jest.mock('common/modules/commercial/ad-prefs.lib', () => ({
    getAdConsentState: jest.fn(),
}));

type SetupParams = {
    consent: boolean | null,
    switchedOn: boolean,
};

describe('Facebook tracking pixel', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        config.set('libs.facebookAccountId', 'test-account-id');
    });

    const setup = (params: SetupParams) => {
        getAdConsentState.mockReturnValueOnce(params.consent);
        config.set('switches.facebookTrackingPixel', params.switchedOn);
    };

    it('should not load if switch is off', () => {
        setup({ consent: true, switchedOn: false });
        const result = fbPixel();
        expect(result.shouldRun).toBe(false);
    });

    it('should load if the switch enabled', () => {
        setup({ consent: true, switchedOn: true });
        const result = fbPixel();
        expect(result.shouldRun).toBe(true);
    });

    it('should send correct "netid" param', () => {
        setup({ consent: true, switchedOn: true });
        const result = fbPixel();
        expect(result.url).toBe(
            'https://www.facebook.com/tr?id=test-account-id&ev=PageView&noscript=1'
        );
    });

    it('should use images', () => {
        setup({ consent: true, switchedOn: true });
        const result = fbPixel();
        expect(result.useImage).toBe(true);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
});
