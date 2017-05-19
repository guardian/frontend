// @flow
import * as ab from 'common/modules/experiments/ab';
import {
    getParticipations,
    isParticipating,
    participationsKey,
    cleanParticipations,
} from 'common/modules/experiments/utils';
import { variantIdFor } from 'common/modules/experiments/segment-util';
import { local } from 'lib/storage';
import { overwriteMvtCookie } from 'common/modules/analytics/mvt-cookie';

import { TESTS } from 'common/modules/experiments/ab-tests';
import config from 'lib/config';

import { genAbTest } from './__fixtures__/ab-test';

jest.mock('lib/storage');
jest.mock('common/modules/analytics/mvt-cookie');
jest.mock('common/modules/experiments/ab-tests');
jest.mock('lodash/functions/memoize', () => f => f);
jest.mock('ophan/ng', () => null);
jest.mock('raven-js', () => null);

describe('A/B tests', () => {
    beforeEach(() => {
        // enable all test switches
        TESTS.forEach(test => {
            config.switches[`ab${test.id}`] = true;
        });
    });

    afterEach(() => {
        local.storage = {};
    });

    describe('User segmentation', () => {
        test('tests should not run when switched off', () => {
            const dummyTest = genAbTest('DummyTest');
            const controlSpy = jest.spyOn(dummyTest.variants[0], 'test');
            const variantSpy = jest.spyOn(dummyTest.variants[1], 'test');

            config.switches.abDummyTest = false;

            ab.segment([dummyTest]);
            ab.run([dummyTest]);

            expect(controlSpy).not.toHaveBeenCalled();
            expect(variantSpy).not.toHaveBeenCalled();
        });

        test('users should be assigned to a variant', () => {
            ab.segment(TESTS);
            ab.run(TESTS);

            TESTS.forEach(test => {
                expect(isParticipating(test)).toBeTruthy();
            });
        });

        test('all non-participating users should be put in a "not in test" group', () => {
            const dummyTest = genAbTest('DummyTest');
            const controlSpy = jest.spyOn(dummyTest.variants[0], 'test');
            const variantSpy = jest.spyOn(dummyTest.variants[1], 'test');

            dummyTest.audience = 0;

            ab.segment([dummyTest]);
            ab.run([dummyTest]);

            expect(controlSpy).not.toHaveBeenCalled();
            expect(variantSpy).not.toHaveBeenCalled();
            expect(variantIdFor(dummyTest)).toBe('notintest');
        });

        test("tests should not segment users when they can't be run", () => {
            const dummyTest = genAbTest('DummyTest', false);

            ab.segment([dummyTest]);
            expect(getParticipations()).toEqual({});
        });

        test('users should not be segmented if the test has expired', () => {
            const dummyTest = genAbTest('DummyTest', false);
            dummyTest.expiry = '1999-01-01';

            ab.segment([dummyTest]);
            expect(getParticipations()).toEqual({});
        });

        test('users should not be segmented if the test is switched off', () => {
            const dummyTest = genAbTest('DummyTest');
            config.switches.abDummyTest = false;

            ab.segment([dummyTest]);
            expect(getParticipations()).toEqual({});
        });

        test("users shouldn't be segmented if they already belong to the test", () => {
            const dummyTest = genAbTest('DummyTest');

            overwriteMvtCookie(1);
            ab.segment([dummyTest]);
            expect(getParticipations().DummyTest.variant).toEqual('variant');
        });

        test('all tests should be retrieved', () => {
            ab.segment(TESTS);

            expect(Object.keys(getParticipations())).toEqual(
                TESTS.map(t => t.id)
            );
        });

        test('expired tests should be cleaned from participations', () => {
            const dummyTest = genAbTest('DummyTest');

            local.set(
                participationsKey,
                '{ "value": { "DummyTest": { "variant": "foo" } } }'
            );
            dummyTest.expiry = '1999-01-01';
            ab.segment([dummyTest]);
            cleanParticipations([dummyTest]);

            expect(getParticipations()).toEqual({});
        });

        test('participations that have been removed/renamed should be removed', () => {
            const dummyTest = genAbTest('DummyTestNew');

            local.set(
                participationsKey,
                '{ "value": { "DummyTest": { "variant": "foo" } } }'
            );
            ab.segment([dummyTest]);
            cleanParticipations([dummyTest]);

            expect(getParticipations()).toEqual({});
        });

        test('forcing users into tests', () => {
            const dummyTest = genAbTest('DummyTest');

            ab.segment([dummyTest]);
            expect(getParticipations().DummyTest.variant).toBe('variant');

            ab.forceSegment('DummyTest', 'control');
            expect(getParticipations().DummyTest.variant).toBe('control');
        });
    });

    describe('Running tests', () => {
        test('starting a test', () => {
            const dummyTest = genAbTest('DummyTest');
            const controlSpy = jest.spyOn(dummyTest.variants[0], 'test');
            const variantSpy = jest.spyOn(dummyTest.variants[1], 'test');

            ab.segment([dummyTest]);
            ab.run([dummyTest]);

            expect(
                controlSpy.mock.calls.length + variantSpy.mock.calls.length
            ).toEqual(1);
        });

        test('tests should run until the end of the expiry day', () => {
            // ... we need the current date in 'yyyy-mm-dd' format:
            const dateString = new Date().toISOString().substring(0, 10);

            const dummyTest = genAbTest('DummyTest');
            const controlSpy = jest.spyOn(dummyTest.variants[0], 'test');
            const variantSpy = jest.spyOn(dummyTest.variants[1], 'test');

            dummyTest.expiry = dateString;

            ab.segment([dummyTest]);
            ab.run([dummyTest]);

            expect(Object.keys(getParticipations())).toEqual(['DummyTest']);
            expect(
                controlSpy.mock.calls.length + variantSpy.mock.calls.length
            ).toEqual(1);
        });

        test('tests should not run after the expiry date', () => {
            const dummyTest = genAbTest('DummyTest');
            const controlSpy = jest.spyOn(dummyTest.variants[0], 'test');
            const variantSpy = jest.spyOn(dummyTest.variants[1], 'test');

            dummyTest.expiry = '1999-01-01';

            ab.segment([dummyTest]);
            ab.run([dummyTest]);

            expect(controlSpy).not.toHaveBeenCalled();
            expect(variantSpy).not.toHaveBeenCalled();
        });
    });
});
