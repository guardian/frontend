// @flow
import { isInVariant } from 'common/modules/experiments/utils';
import { abTestClashData as acquisitionsAbTestClashData } from 'common/modules/experiments/acquisition-test-selector';

const emailTests: $ReadOnlyArray<ABTest> = [];
const contributionsTests: $ReadOnlyArray<ABTest> = acquisitionsAbTestClashData;

const potentiallyClashingTests: $ReadOnlyArray<
    ABTest
> = contributionsTests.concat(emailTests);

const testABClash = (
    f: (test: ABTest, variant: Variant) => boolean,
    tests: $ReadOnlyArray<ABTest>
): boolean =>
    tests.some(test =>
        test.variants
            .filter(variant => {
                const compliant =
                    variant &&
                    variant.options &&
                    variant.options.isOutbrainCompliant;
                return !compliant;
            })
            .some(variant => f(test, variant))
    );

export const userIsInAClashingAbTest = (
    tests: $ReadOnlyArray<ABTest> = potentiallyClashingTests
) => testABClash(isInVariant, tests);

export { emailTests, contributionsTests };
