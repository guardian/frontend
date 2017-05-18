// @flow
import { segment } from 'common/modules/experiments/ab';
import {
    registerCompleteEvents,
    registerImpressionEvents,
    buildOphanPayload,
} from 'common/modules/experiments/ab-ophan';

import { local } from 'lib/storage';

import { TESTS } from 'common/modules/experiments/ab-tests';
import config from 'lib/config';

import { genAbTest } from '../__fixtures__/ab-test';

jest.mock('lib/storage');
jest.mock('lib/report-error');
jest.mock('common/modules/analytics/mvt-cookie');
jest.mock('common/modules/experiments/ab-tests');
jest.mock('lodash/functions/memoize', () => f => f);
jest.mock('ophan/ng', () => null);
jest.mock('raven-js', () => null);

describe('A/B Ophan analytics', () => {
    beforeEach(() => {
        // enable all test switches
        TESTS.forEach(test => {
            config.switches[`ab${test.id}`] = true;
        });

        // empty server-side tests
        config.tests = [];
    });

    afterEach(() => {
        local.storage = {};
    });

    test('Ophan data structure contains the correct values', () => {
        segment(TESTS);

        expect(buildOphanPayload()).toEqual({
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
        const dummy = genAbTest('DummyTest');
        dummy.variants[0].success = () => undefined;
        const spy = jest.spyOn(dummy.variants[0], 'success');

        segment([dummy]);
        registerCompleteEvents([dummy]);

        expect(spy).toHaveBeenCalled();
    });

    test('success function fires when canRun is false', () => {
        const dummy = genAbTest('DummyTest');
        dummy.variants[0].success = () => undefined;
        const spy = jest.spyOn(dummy.variants[0], 'success');

        segment([dummy]);
        dummy.canRun = () => false;
        registerCompleteEvents([dummy]);

        expect(spy).toHaveBeenCalled();
    });

    test('defer firing the impression when the function is provided', () => {
        const dummy = genAbTest('DummyTest');

        /**
         * impression events are only registered if every variant has an `impression` function
         */
        dummy.variants.forEach(v => (v.impression = () => undefined));

        const controlSpy = jest.spyOn(dummy.variants[0], 'impression');
        const variantSpy = jest.spyOn(dummy.variants[1], 'impression');

        segment([dummy]);
        registerImpressionEvents([dummy]);

        expect(
            controlSpy.mock.calls.length + variantSpy.mock.calls.length
        ).toEqual(1);
    });
});
