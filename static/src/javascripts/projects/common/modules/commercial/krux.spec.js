// @flow
import { krux } from 'common/modules/commercial/krux';

const { url, shouldRun } = krux;

jest.mock('lib/raven');
jest.mock('ophan/ng', () => null);

/**
 * we have to mock config like this because
 * loading krux has side affects
 * that are dependent on config.
 * */
jest.mock('lib/config', () => {
    const defaultConfig = {
        switches: {
            krux: false,
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

describe('Krux', () => {
    it('should not load if switch is off', () => {
        expect(shouldRun).toBe(false);
    });

    it('should send correct "netid" param', () => {
        expect(url).toBe('//cdn.krxd.net/controltag?confid=JVZiE3vn');
    });
});
