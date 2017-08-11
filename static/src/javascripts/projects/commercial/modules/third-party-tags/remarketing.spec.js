// @flow

import { remarketing } from 'commercial/modules/third-party-tags/remarketing';

const { shouldRun, url } = remarketing;
const onLoad: any = remarketing.onLoad;

jest.mock('lib/config', () => ({
    switches: {
        remarketing: true,
    },
}));

describe('Remarketing', () => {
    it('should exist', () => {
        expect(shouldRun).toEqual(true);
        expect(url).toEqual(
            expect.stringContaining('www.googleadservices.com')
        );
        expect(onLoad).toBeDefined();
    });

    it('should call google_trackConversion', () => {
        window.google_trackConversion = jest.fn();
        window.google_tag_params = 'google_tag_params__test';
        onLoad();
        expect(window.google_trackConversion).toHaveBeenCalledWith({
            google_conversion_id: 971225648,
            google_custom_params: 'google_tag_params__test',
            google_remarketing_only: true,
        });
    });
});
