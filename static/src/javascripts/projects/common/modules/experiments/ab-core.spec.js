// @flow

import { genAbTest } from 'common/modules/experiments/__fixtures__/ab-test';
import { runnableTest } from 'common/modules/experiments/ab-core';
import config from 'lib/config';

jest.mock('common/modules/analytics/mvt-cookie', () => ({
    getMvtValue: () => 2,
    getMvtNumValues: () => 10,
}));

describe('A/B tests', () => {
    beforeEach(() => {
        config.page = {};
        config.page.isSensitive = false;
        config.switches.abDummyTest = true;
    });

    afterEach(() => {});

    describe('runnableTest', () => {
        test('should return a test with variantToRun if test is runnable', () => {
            expect(config.get('switches.abDummyTest')).toEqual(true);
            const test = genAbTest('DummyTest');
            const rt = runnableTest(test);
            expect(rt).not.toBeNull();

            if (rt) {
                expect(rt.variantToRun).toHaveProperty('id', 'control');
            }
        });

        test('should return null for an expired test', () => {
            const expiredTest = genAbTest('DummyTest', true, '2000-01-01');
            expect(runnableTest(expiredTest)).toEqual(null);
        });

        // test('should return null for a test which is switched off')

        // test('should return null if the test cannot be run')

        // test('should return null if the test can be run but the variant cannot')

        // test('should return a different variantToRun if the MVT cookie is different and localStorage is cleared')

        // test('should return the same variantToRun if the MVT cookie is different but the localStorage participations are preserved')

        // test('should return the variantToRun specified by the URL, overriding localStorage and cookie')

        // test('should return the variantToRun specified by localStorage, overriding cookie')

        // test('should return the variantToRun specified by the cookie, iff URL and localStorage are absent')

        // test('should give the same result whether it's called before or after persisting to localStorage (runAndTrackAbTests)')

        // test('should return null if notintest is specified in localStorage or in the URL hash')
    });

    // test('expired tests should be removed from localStorage')

    test('renamed/deleted tests should be removed from localStorage', () => {
        // This should fail if testSwitchExists() check is removed
    })

    // test('should return null for a test which is switched off')

    // test('tests with notintest participations should not run, but this should be persisted to localStorage')

    // allRunnableTests

    // firstRunnableTest

    // isInVariant

    // getVariant
});
