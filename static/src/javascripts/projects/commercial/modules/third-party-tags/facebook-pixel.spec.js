// @flow
import * as adPrefs from 'common/modules/commercial/ad-prefs.lib';
import config from 'lib/config';

import { fbPixel } from 'commercial/modules/third-party-tags/facebook-pixel';

jest.mock('common/modules/commercial/ad-prefs.lib', () => ({
    getAdConsentState: jest.fn(),
}));
const consentSpy = jest.spyOn(adPrefs, 'getAdConsentState');

type SetupParams = {
    consent: boolean | null,
    switchedOn: boolean,
};

describe('Facebook tracking pixel', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        config.libs.facebookAccountId = 'test-account-id';
    });

    const setup = (params: SetupParams) => {
        consentSpy.mockReturnValueOnce(params.consent);
        config.switches = { facebookTrackingPixel: params.switchedOn };
    };

    it('should not load if switch is off', () => {
        setup({ consent: true, switchedOn: false });
        const result = fbPixel();
        expect(result.shouldRun).toBe(false);
    });

    it('should not load if consent has been denied', () => {
        setup({ consent: false, switchedOn: true });
        const result = fbPixel();
        expect(result.shouldRun).toBe(false);
    });

    it('should load if consent is available and the switch enabled', () => {
        setup({ consent: true, switchedOn: true });
        const result = fbPixel();
        expect(result.shouldRun).toBe(true);
    });

    it('if the switch is enabled and consent is null, do not load', () => {
        setup({ consent: null, switchedOn: true });
        const result = fbPixel();
        expect(result.shouldRun).toBe(false);
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
