// @flow
import { getAdConsentState as _getAdConsentState } from 'common/modules/commercial/ad-prefs.lib';
import { remarketing } from 'commercial/modules/third-party-tags/remarketing';
import config from 'lib/config';

const getAdConsentState: any = _getAdConsentState;

jest.mock('common/modules/commercial/ad-prefs.lib', () => ({
    getAdConsentState: jest.fn(),
}));

describe('Remarketing', () => {
    beforeAll(() => {
        config.set('switches.remarketing', true);
    });
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should exist', () => {
        getAdConsentState.mockReturnValue(true);
        const { shouldRun, url, onLoad } = remarketing();

        expect(shouldRun).toEqual(true);
        expect(url).toEqual(
            expect.stringContaining('www.googleadservices.com')
        );
        expect(onLoad).toBeDefined();
    });

    it('shouldRun returns false only if consent has been denied', () => {
        getAdConsentState.mockReturnValueOnce(true);
        getAdConsentState.mockReturnValueOnce(false);
        getAdConsentState.mockReturnValueOnce(null);

        const shouldRunTrue = remarketing().shouldRun;
        const shouldRunFalse = remarketing().shouldRun;
        const shouldRunNull = remarketing().shouldRun;

        expect(shouldRunTrue).toEqual(true);
        expect(shouldRunFalse).toEqual(false);
        expect(shouldRunNull).toEqual(false);
    });

    it('should call google_trackConversion', () => {
        const { onLoad } = remarketing();
        window.google_trackConversion = jest.fn();
        window.google_tag_params = 'google_tag_params__test';
        if (onLoad) onLoad();
        expect(window.google_trackConversion).toHaveBeenCalledWith({
            google_conversion_id: 971225648,
            google_custom_params: 'google_tag_params__test',
            google_remarketing_only: true,
        });
    });
});
