// @flow

import { isOutbrainCompliant } from 'common/modules/experiments/ab-test-clash';
import { overwriteMvtCookie } from 'common/modules/analytics/mvt-cookie';
import {
    logView,
    clear as clearViewLog,
} from 'common/modules/commercial/acquisitions-view-log';
import { genAbTest } from './__fixtures__/ab-test';

jest.mock('lib/storage');
jest.mock('common/modules/analytics/mvt-cookie');
jest.mock('common/modules/experiments/acquisition-test-selector', () => ({
    abTestClashData: [],
}));
jest.mock('common/modules/commercial/targeting-tool', () => null);
jest.mock('ophan/ng', () => null);

describe('A/B test clash', () => {
    beforeEach(() => {
        clearViewLog();
    });

    describe('Outbrain compliance check', () => {
        test('should be true when the user is not allocated to a clashing test', () => {
            const test = genAbTest('foo');

            test.audience = 0.1;
            test.audienceOffset = 0;
            test.variants = [
                {
                    id: 'control',
                    options: {
                        isOutbrainCompliant: false,
                    },
                    test: () => undefined,
                },
            ];

            overwriteMvtCookie(999999);

            expect(isOutbrainCompliant(test)).toBeTruthy();
        });

        test('should be true when all variants are flagged as compliant', () => {
            const test = genAbTest('foo');

            test.audience = 1;
            test.audienceOffset = 0;
            test.variants = [
                {
                    id: 'control',
                    options: {
                        isOutbrainCompliant: true,
                    },
                    test: () => undefined,
                },
                {
                    id: 'variant',
                    options: {
                        isOutbrainCompliant: true,
                    },
                    test: () => undefined,
                },
            ];

            expect(isOutbrainCompliant(test)).toBeTruthy();
        });

        test('should be false when the user is in a non-compliant variant without view limiting', () => {
            const test = genAbTest('viewable');

            test.audience = 1;
            test.audienceOffset = 0;
            test.variants = [
                {
                    id: 'control',
                    options: {
                        isOutbrainCompliant: false,
                    },
                    test: () => undefined,
                },
                {
                    id: 'variant',
                    options: {
                        isOutbrainCompliant: false,
                    },
                    test: () => undefined,
                },
            ];

            overwriteMvtCookie(999999);
            expect(isOutbrainCompliant(test)).toBeFalsy();
        });

        test('should be false when the user is in a non-compliant variant that can be viewed', () => {
            const test = genAbTest('viewable');

            test.audience = 1;
            test.audienceOffset = 0;
            test.variants = [
                {
                    id: 'control',
                    options: {
                        isUnlimited: true,
                        isOutbrainCompliant: false,
                    },
                    test: () => undefined,
                },
                {
                    id: 'variant',
                    options: {
                        isUnlimited: true,
                        isOutbrainCompliant: false,
                    },
                    test: () => undefined,
                },
            ];

            overwriteMvtCookie(999999);
            expect(isOutbrainCompliant(test)).toBeFalsy();
        });

        test('should be true when the user is in a non-compliant variant that cannot be viewed due to view limits', () => {
            const test = genAbTest('overlimit');

            logView('overlimit');

            test.audience = 1;
            test.audienceOffset = 0;
            test.variants = [
                {
                    id: 'control',
                    options: {
                        isOutbrainCompliant: false,
                        maxViews: {
                            days: 30,
                            count: 0,
                            minDaysBetweenViews: 999,
                        },
                    },
                    test: () => undefined,
                },
            ];

            expect(isOutbrainCompliant(test)).toBeTruthy();
        });
    });
});
