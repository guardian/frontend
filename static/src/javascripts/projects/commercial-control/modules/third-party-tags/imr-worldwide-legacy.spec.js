// @flow
import { imrWorldwideLegacy } from './imr-worldwide-legacy';

const { shouldRun, url, onLoad } = imrWorldwideLegacy;

jest.mock('lib/config', () => ({
    switches: {
        imrWorldwide: true,
    },
}));

describe('third party tag IMR worldwide legacy', () => {
    it('should exist and have the correct exports', () => {
        expect(shouldRun).toBe(true);
        expect(onLoad).toBeDefined();
        expect(url).toBe('//secure-au.imrworldwide.com/v60.js');
    });
});
