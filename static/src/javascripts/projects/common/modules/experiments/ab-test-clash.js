// @flow
import { isInVariant } from 'common/modules/experiments/utils';
import { abTestClashData as acquisitionsAbTestClashData } from 'common/modules/experiments/acquisition-test-selector';

const emailTests: Object[] = [];
const contributionsTests: Object[] = acquisitionsAbTestClashData;

const potentiallyClashingTests: Object[] = contributionsTests.concat(
    emailTests
);

export { emailTests, contributionsTests };

export const testABClash = (
    f: (test: ABTest, variant: Variant) => boolean,
    tests: Object[]
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
    tests: Object[] = potentiallyClashingTests
) => testABClash(isInVariant, tests);
