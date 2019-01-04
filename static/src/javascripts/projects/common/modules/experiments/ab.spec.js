// @flow

import { genAbTest } from 'common/modules/experiments/__fixtures__/ab-test';
import { runnableTest } from 'common/modules/experiments/ab';
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

    afterEach(() => {
    });


    describe('runnableTest', () => {
        test('should return a test with variantToRun if test is runnable', () => {
            expect(config.get('switches.abDummyTest')).toEqual(true);
            const test = genAbTest('DummyTest');
            const rt = runnableTest(test);
            expect(rt).not.toBeNull();


            if (rt) {
                expect(rt.variantToRun).toHaveProperty('id', 'control')
            }
        });

        test('should return null for an expired test', () => {
            const expiredTest = genAbTest('DummyTest', true, '2000-01-01');
            expect(runnableTest(expiredTest)).toEqual(null);
        });
    });

    // test('should return null for a test which is switched off')

    // test('should return ')
});
