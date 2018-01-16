// @flow
import { tourismAustralia } from './tourism-australia';

const { shouldRun, url, useImage } = tourismAustralia;

jest.mock('lib/config', () => ({
    switches: {
        tourismAustralia: true,
    },
    page: {
        section: 'ashes-australia-travel',
    },
}));

describe('third party tag Tourism Australia', () => {
    it('should exist and have exported values', () => {
        const expectedUrl =
            '//tourismaustralia.sc.omtrdc.net/b/ss/tuatourism-australia-global';

        expect(shouldRun).toBe(true);
        expect(url).toContain(expectedUrl);
        expect(useImage).toBe(true);
    });
});
