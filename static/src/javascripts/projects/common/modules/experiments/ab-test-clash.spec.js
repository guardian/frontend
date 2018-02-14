// @flow

import { isInVariant as isInVariant_ } from './segment-util';
import { testCanBeRun as testCanBeRun_ } from './test-can-run-checks';
import { userIsInAClashingAbTest } from './ab-test-clash';

const isInVariant: JestMockFn<*, *> = (isInVariant_: any);
const testCanBeRun: JestMockFn<*, *> = (testCanBeRun_: any);

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

jest.mock('common/modules/experiments/segment-util', () => ({
    isInVariant: jest.fn(() => true),
}));

jest.mock('common/modules/experiments/test-can-run-checks', () => ({
    testCanBeRun: jest.fn(() => true),
}));

jest.mock('common/modules/experiments/acquisition-test-selector', () => ({
    abTestClashData: [],
}));

describe('Clash', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('test clash should return false if test has only outbrain compliant variant', () => {
        isInVariant.mockReturnValueOnce(undefined);
        testCanBeRun.mockReturnValueOnce(undefined);

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

        expect(userIsInAClashingAbTest(clashingTests)).toBeFalsy();
        expect(isInVariant).not.toHaveBeenCalled();
    });

    test('test clash should return true if test has outbrain non compliant variant and f returns true', () => {
        isInVariant.mockReturnValueOnce(true);
        testCanBeRun.mockReturnValueOnce(true);

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

        expect(userIsInAClashingAbTest([test])).toBeTruthy();
        expect(isInVariant).toHaveBeenCalledTimes(1);
        expect(isInVariant).toHaveBeenCalledWith(test, test.variants[1]);
    });

    test('test clash should return false if test has outbrain non compliant variant and f returns true', () => {
        isInVariant.mockReturnValueOnce(false);
        testCanBeRun.mockReturnValueOnce(false);

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

        expect(userIsInAClashingAbTest([test])).toBeFalsy();
        expect(isInVariant).toHaveBeenCalledTimes(1);
        expect(isInVariant).toHaveBeenCalledWith(test, test.variants[1]);
    });
});
