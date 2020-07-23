// @flow
import config from 'lib/config';

import { fbPixel } from 'commercial/modules/third-party-tags/facebook-pixel';

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

    it('should send correct "netid" param and sourcepointId', () => {
        setup({ consent: true, switchedOn: true });
        const result = fbPixel();
        expect(result.url).toBe(
            'https://www.facebook.com/tr?id=test-account-id&ev=PageView&noscript=1'
        );
        expect(result.sourcepointId).toBe(
            '5e7e1298b8e05c54a85c52d2'
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
