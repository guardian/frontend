// @flow
import {
    registerCompleteEvents,
    registerImpressionEvents,
    buildOphanPayload,
} from 'common/modules/experiments/ab-ophan';

import { local } from 'lib/storage';

import { concurrentTests } from 'common/modules/experiments/ab-tests';
import config from 'lib/config';

import { genRunnableAbTestWhereControlIsRunnable } from './__fixtures__/ab-test';

jest.mock('lib/raven');
jest.mock('lib/storage');
jest.mock('lib/report-error');
jest.mock('common/modules/analytics/mvt-cookie');
jest.mock('lodash/memoize', () => f => f);
jest.mock('ophan/ng', () => null);

describe('A/B Ophan analytics', () => {
    beforeEach(() => {
        // enable all test switches
        concurrentTests.forEach(test => {
            config.set(`switches.ab${test.id}`, true);
        });

        // empty server-side tests
        config.set('tests', []);
    });

    afterEach(() => {
        local.storage = {};
    });

    test('Ophan data structure contains the correct values', () => {
        expect(
            buildOphanPayload([
                genRunnableAbTestWhereControlIsRunnable('DummyTest'),
                genRunnableAbTestWhereControlIsRunnable('DummyTest2'),
            ])
        ).toEqual({
            DummyTest: {
                variantName: 'control',
                complete: 'false',
            },

            DummyTest2: {
                variantName: 'control',
                complete: 'false',
            },
        });
    });

    test('success function fires when canRun is true', () => {
        const dummy = genRunnableAbTestWhereControlIsRunnable('DummyTest');
        dummy.variants[0].success = () => undefined;
        const spy = jest.spyOn(dummy.variants[0], 'success');

        registerCompleteEvents([dummy]);

        expect(spy).toHaveBeenCalled();
    });

    test('success function fires when canRun is false', () => {
        const dummy = genRunnableAbTestWhereControlIsRunnable('DummyTest');
        dummy.variants[0].success = () => undefined;
        const spy = jest.spyOn(dummy.variants[0], 'success');

        dummy.canRun = () => false;
        registerCompleteEvents([dummy]);

        expect(spy).toHaveBeenCalled();
    });

    test('defer firing the impression when the function is provided', () => {
        const dummy = genRunnableAbTestWhereControlIsRunnable('DummyTest');

        /**
         * impression events are only registered if every variant has an `impression` function
         */
        dummy.variants.forEach(v => {
            v.impression = () => undefined;
        });

        const controlSpy = jest.spyOn(dummy.variants[0], 'impression');
        const variantSpy = jest.spyOn(dummy.variants[1], 'impression');

        registerImpressionEvents([dummy]);

        expect(
            controlSpy.mock.calls.length + variantSpy.mock.calls.length
        ).toEqual(1);
    });
});
