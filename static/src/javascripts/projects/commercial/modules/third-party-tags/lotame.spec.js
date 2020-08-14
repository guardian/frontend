// @flow
import { lotame } from 'commercial/modules/third-party-tags/lotame';
import config from 'lib/config';
import { shouldUseSourcepointCmp as shouldUseSourcepointCmp_ } from 'commercial/modules/cmp/sourcepoint';

const shouldUseSourcepointCmp: any = shouldUseSourcepointCmp_;

jest.mock('common/modules/commercial/geo-utils', () => ({
    isInUsOrCa: jest.fn().mockReturnValue(true),
    isInAuOrNz: jest.fn().mockReturnValue(false),
}));

jest.mock('commercial/modules/cmp/sourcepoint', () => ({
    shouldUseSourcepointCmp: jest.fn().mockImplementation(() => false),
}));

describe('Lotame', () => {
    beforeAll(() => {
        config.set('switches.lotame', true);
    });
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should exist', () => {
        shouldUseSourcepointCmp.mockReturnValue(true);
        const { shouldRun, url, sourcepointId } = lotame();

        expect(shouldRun).toEqual(true);
        expect(url).toEqual(expect.stringContaining('crwdcntrl'));
        expect(sourcepointId).toBe('5ed6aeb1b8e05c241a63c71f');
    });

    it('shouldRun to be true if ad the switch is on', () => {
        shouldUseSourcepointCmp.mockReturnValue(true);
        const { shouldRun } = lotame();

        expect(shouldRun).toEqual(true);
    });

    it('shouldRun to be false if the switch is off', () => {
        config.set('switches.lotame', false);
        const { shouldRun } = lotame();

        expect(shouldRun).toEqual(false);
    });
});
