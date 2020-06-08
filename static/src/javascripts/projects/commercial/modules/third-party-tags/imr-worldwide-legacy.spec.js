// @flow
import { imrWorldwideLegacy } from './imr-worldwide-legacy';

const { shouldRun, url, onLoad } = imrWorldwideLegacy;

jest.mock('commercial/modules/header-bidding/utils', () => {
    // $FlowFixMe property requireActual is actually not missing Flow.
    const original = jest.requireActual('commercial/modules/header-bidding/utils');
    return {
        ...original,
        isInAuRegion: jest.fn().mockReturnValue(true),
    };
});

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

/**
 * we have to mock config like this because
 * loading imr-worldwide-legacy has side affects
 * that are dependent on config.
 * */
jest.mock('lib/config', () => {
    const defaultConfig = {
        switches: {
            imrWorldwide: true,
        },
    };

    return Object.assign({}, defaultConfig, {
        get: (path: string = '', defaultValue: any) =>
            path
                .replace(/\[(.+?)]/g, '.$1')
                .split('.')
                .reduce((o, key) => o[key], defaultConfig) || defaultValue,
    });
});

describe('third party tag IMR worldwide legacy', () => {
    it('should exist and have the correct exports', () => {
        expect(shouldRun).toBe(true);
        expect(onLoad).toBeDefined();
        expect(url).toBe('//secure-au.imrworldwide.com/v60.js');
    });
});
