// @flow
import { variantFor } from 'common/modules/experiments/segment-util';
import {
    abTestClashData as acquisitionsAbTestClashData,
    isViewable,
} from 'common/modules/experiments/acquisition-test-selector';

const emailTests: $ReadOnlyArray<ABTest> = [];
const contributionsTests: $ReadOnlyArray<ABTest> = acquisitionsAbTestClashData;

const potentiallyClashingTests: $ReadOnlyArray<
    ABTest
> = contributionsTests.concat(emailTests);

/**
 * Outbrain compliance for a (potentially clashing) test means at least
 * one of the following is true:
 *
 *   1. the user isn't in a variant for the test
 *   2. the assigned variant has been explicitly flagged as compliant
 *   3. the assigned variant won't be rendered due to view limiting
 */
export const isOutbrainCompliant = (test: ABTest): boolean => {
    const variant = variantFor(test);

    if (variant)
        return (
            (!!variant.options && !!variant.options.isOutbrainCompliant) ||
            !isViewable(variant, test)
        );

    return true;
};

export const userIsInAClashingAbTest = (
    tests: $ReadOnlyArray<ABTest> = potentiallyClashingTests
) => tests.some(test => !isOutbrainCompliant(test));

export { emailTests, contributionsTests };
