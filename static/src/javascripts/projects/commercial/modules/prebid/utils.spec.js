// @flow
import { getSync as getSync_ } from 'lib/geolocation';
import { getBreakpoint as getBreakpoint_ } from 'lib/detect';
import { testCanBeRun as testCanBeRun_ } from 'common/modules/experiments/test-can-run-checks';
import { getParticipations as getParticipations_ } from 'common/modules/experiments/utils';
import {
    getBreakpointKey,
    shouldIncludeAdYouLike,
    shouldIncludeAppNexus,
    shouldIncludeOpenx,
    shouldIncludeOzone,
    shouldIncludeTrustX,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
} from './utils';

const getSync: any = getSync_;
const getBreakpoint: any = getBreakpoint_;
const testCanBeRun: any = testCanBeRun_;
const getParticipations: any = getParticipations_;

jest.mock('lodash/functions/once', () => a => a);

jest.mock('lib/geolocation', () => ({
    getSync: jest.fn(() => 'GB'),
}));

jest.mock('lib/detect', () => ({
    getBreakpoint: jest.fn(() => 'mobile'),
}));

jest.mock('common/modules/experiments/test-can-run-checks');
jest.mock('common/modules/experiments/utils');

describe('Utils', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('getBreakpointKey should find the correct key', () => {
        const breakpoints = ['mobile', 'phablet', 'tablet', 'desktop', 'wide'];
        const results = [];
        for (let i = 0; i < breakpoints.length; i += 1) {
            getBreakpoint.mockReturnValueOnce(breakpoints[i]);
            results.push(getBreakpointKey());
        }
        expect(results).toEqual(['M', 'M', 'T', 'D', 'D']);
    });

    test('shouldIncludeAppNexus should return true if geolocation is AU', () => {
        getSync.mockReturnValueOnce('AU');
        expect(shouldIncludeAppNexus()).toBe(true);
    });

    test('shouldIncludeAppNexus should return true if geolocation is NZ', () => {
        getSync.mockReturnValueOnce('NZ');
        expect(shouldIncludeAppNexus()).toBe(true);
    });

    test('shouldIncludeAppNexus should otherwise return false', () => {
        const testGeos = ['FK', 'GI', 'GG', 'IM', 'JE', 'SH', 'CA', 'US'];
        for (let i = 0; i < testGeos.length; i += 1) {
            getSync.mockReturnValueOnce(testGeos[i]);
            expect(shouldIncludeAppNexus()).toBe(false);
        }
    });

    test('shouldIncludeOpenx should return true if geolocation is UK', () => {
        getSync.mockReturnValueOnce('UK');
        expect(shouldIncludeOpenx()).toBe(true);
    });

    test('shouldIncludeOpenx should return true if within ROW region', () => {
        const testGeos = ['FK', 'GI', 'GG', 'IM', 'JE', 'SH', 'IE'];
        for (let i = 0; i < testGeos.length; i += 1) {
            getSync.mockReturnValueOnce(testGeos[i]);
            expect(shouldIncludeOpenx()).toBe(true);
        }
    });

    test('shouldIncludeOpenx should return false if within AU/US region', () => {
        const testGeos = ['NZ', 'CA', 'US', 'AU'];
        for (let i = 0; i < testGeos.length; i += 1) {
            getSync.mockReturnValue(testGeos[i]);
            expect(shouldIncludeOpenx()).toBe(false);
        }
    });

    test('shouldIncludeTrustX should return true if geolocation is US', () => {
        getSync.mockReturnValueOnce('US');
        expect(shouldIncludeTrustX()).toBe(true);
    });

    test('shouldIncludeTrustX should otherwise return false', () => {
        const testGeos = ['FK', 'GI', 'GG', 'IM', 'JE', 'SH', 'AU'];
        for (let i = 0; i < testGeos.length; i += 1) {
            getSync.mockReturnValueOnce(testGeos[i]);
            expect(shouldIncludeTrustX()).toBe(false);
        }
    });

    xtest('shouldIncludeOzone should return false for excluded geolocations', () => {
        const excludedGeos = ['US', 'CA', 'NZ', 'AU'];
        for (let i = 0; i < excludedGeos.length; i += 1) {
            getSync.mockReturnValueOnce(excludedGeos[i]);
            expect(shouldIncludeOzone()).toBe(false);
        }
    });

    xtest('shouldIncludeOzone should otherwise return true if fate decrees', () => {
        const mockMath = Object.create(global.Math);
        mockMath.random = () => 0;
        global.Math = mockMath;
        expect(shouldIncludeOzone()).toBe(true);
    });

    test('stripMobileSuffix', () => {
        expect(stripMobileSuffix('top-above-nav--mobile')).toBe(
            'top-above-nav'
        );
        expect(stripMobileSuffix('inline1--mobile')).toBe('inline1');
    });

    test('stripTrailingNumbersAbove1', () => {
        expect(stripTrailingNumbersAbove1('inline1')).toBe('inline1');
        expect(stripTrailingNumbersAbove1('inline2')).toBe('inline');
        expect(stripTrailingNumbersAbove1('inline10')).toBe('inline');
        expect(stripTrailingNumbersAbove1('inline23')).toBe('inline');
        expect(stripTrailingNumbersAbove1('inline101')).toBe('inline');
        expect(stripTrailingNumbersAbove1('inline456')).toBe('inline');
    });

    test('shouldIncludeAdYouLike when not in any tests', () => {
        testCanBeRun.mockReturnValue(true);
        getParticipations.mockReturnValue(undefined);
        expect(shouldIncludeAdYouLike([[300, 250]])).toBe(false);
        expect(shouldIncludeAdYouLike([[300, 600], [300, 250]])).toBe(false);
        expect(shouldIncludeAdYouLike([[728, 90]])).toBe(false);
    });

    test('shouldIncludeAdYouLike when not in AdYouLike test', () => {
        testCanBeRun.mockReturnValue(true);
        getParticipations.mockReturnValue({
            CommercialPrebidAdYouLike: { variant: 'notintest' },
        });
        expect(shouldIncludeAdYouLike([[300, 250]])).toBe(false);
        expect(shouldIncludeAdYouLike([[300, 600], [300, 250]])).toBe(false);
        expect(shouldIncludeAdYouLike([[728, 90]])).toBe(false);
    });

    test('shouldIncludeAdYouLike when in aylStyle variant', () => {
        testCanBeRun.mockReturnValue(true);
        getParticipations.mockReturnValue({
            CommercialPrebidAdYouLike: { variant: 'aylStyle' },
        });
        expect(shouldIncludeAdYouLike([[300, 250]])).toBe(true);
        expect(shouldIncludeAdYouLike([[300, 600], [300, 250]])).toBe(true);
        expect(shouldIncludeAdYouLike([[728, 90]])).toBe(false);
    });

    test('shouldIncludeAdYouLike when in guardianStyle variant', () => {
        testCanBeRun.mockReturnValue(true);
        getParticipations.mockReturnValue({
            CommercialPrebidAdYouLike: { variant: 'guardianStyle' },
        });
        expect(shouldIncludeAdYouLike([[300, 250]])).toBe(true);
        expect(shouldIncludeAdYouLike([[300, 600], [300, 250]])).toBe(true);
        expect(shouldIncludeAdYouLike([[728, 90]])).toBe(false);
    });
});
