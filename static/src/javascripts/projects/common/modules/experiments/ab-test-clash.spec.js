// @flow

import { testABClash } from './ab-test-clash';

const createTest = (data: Object): ABTest =>
    Object.assign(
        {
            id: 'outbrainCompliantTest',
            start: '',
            expiry: '',
            author: '',
            description: '',
            audience: 1,
            audienceOffset: 1,
            successMeasure: '',
            audienceCriteria: '',
            canRun: () => true,
            variants: [],
        },
        data
    );

const createVariant = (data: Object): Variant =>
    Object.assign(
        {
            // eslint-disable-next-line no-unused-vars
            test(x) {},
        },
        data
    );

jest.mock('common/modules/experiments/utils', () => ({
    isInVariant: jest.fn(() => true),
}));

jest.mock('common/modules/experiments/acquisition-test-selector', () => ({
    abTestClashData: [],
}));

describe('Clash', () => {
    test('test clash should return false if test has only outbrain compliant variant', () => {
        const f = jest.fn();
        const variant = createVariant({
            id: 'control',
            options: {
                isOutbrainCompliant: true,
            },
        });

        const clashingTests = [
            createTest({
                variants: [variant],
            }),
        ];

        expect(testABClash(f, clashingTests)).toBeFalsy();
        expect(f).not.toHaveBeenCalled();
    });

    test('test clash should return true if test has outbrain non compliant variant and f returns true', () => {
        const f = jest.fn(() => true);
        const variant1 = createVariant({
            id: 'control',
            options: {
                isOutbrainCompliant: true,
            },
        });

        const variant2 = createVariant({
            id: 'variant',
            options: {
                isOutbrainCompliant: false,
            },
        });

        const test = createTest({
            variants: [variant1, variant2],
        });
        const clashingTests = [test];

        expect(testABClash(f, clashingTests)).toBeTruthy();
        expect(f).toHaveBeenCalledTimes(1);
        expect(f).toHaveBeenCalledWith(test, test.variants[1]);
    });

    test('test clash should return false if test has outbrain non compliant variant and f returns true', () => {
        const f = jest.fn(() => false);
        const variant1 = createVariant({
            id: 'control',
            options: {
                isOutbrainCompliant: true,
            },
        });
        const variant2 = createVariant({
            id: 'variant',
            options: {
                isOutbrainCompliant: false,
            },
        });
        const test = createTest({
            id: 'outbrainCompliantTest',
            variants: [variant1, variant2],
        });

        expect(testABClash(f, [test])).toBeFalsy();
        expect(f).toHaveBeenCalledTimes(1);
        expect(f).toHaveBeenCalledWith(test, test.variants[1]);
    });
});
