// @flow
import { remarketing } from 'commercial/modules/third-party-tags/remarketing';
import config from 'lib/config';

describe('Remarketing', () => {
    beforeAll(() => {
        config.set('switches.remarketing', true);
    });
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should exist', () => {
        const { shouldRun, url, onLoad, name } = remarketing();

        expect(shouldRun).toEqual(true);
        expect(url).toEqual(
            expect.stringContaining('www.googleadservices.com')
        );
        expect(onLoad).toBeDefined();
        expect(name).toBe(
            'remarketing'
        );
    });

    it('shouldRun to be true if ad the switch is on', () => {
        config.set('switches.remarketing', true);
        const { shouldRun } = remarketing();

        expect(shouldRun).toEqual(true);
    });

    it('shouldRun to be false if the switch is off', () => {
        config.set('switches.remarketing', false);
        const { shouldRun } = remarketing();

        expect(shouldRun).toEqual(false);
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
