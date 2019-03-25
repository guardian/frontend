// @flow

import { remarketing } from 'commercial/modules/third-party-tags/remarketing';

const { shouldRun, url } = remarketing;
const onLoad: any = remarketing.onLoad;

/**
 * we have to mock config like this because
 * loading remarketing has side affects
 * that are dependent on config.
 * */
jest.mock('lib/config', () => {
    const defaultConfig = {
        switches: {
            remarketing: true,
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
