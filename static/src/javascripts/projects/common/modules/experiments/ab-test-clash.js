// @flow
import { isInVariant } from 'common/modules/experiments/segment-util';
import { abTestClashData as acquisitionsAbTestClashData } from 'common/modules/experiments/acquisition-test-selector';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';

const emailTests: $ReadOnlyArray<ABTest> = [];
const contributionsTests: $ReadOnlyArray<ABTest> = acquisitionsAbTestClashData;

const potentiallyClashingTests: $ReadOnlyArray<
    ABTest
> = contributionsTests.concat(emailTests);

export const userIsInAClashingAbTest = (
    tests: $ReadOnlyArray<ABTest> = potentiallyClashingTests
) => {
    const inClashing = tests.some(test => {
        const nonCompliantVariants = test.variants.filter(variant => {
            const compliant =
                variant &&
                variant.options &&
                variant.options.isOutbrainCompliant;
            return !compliant;
        });

        console.log('nonCompliantVariants', nonCompliantVariants);
        const willNonCompliantVariantRun = nonCompliantVariants.some(
            variant => isInVariant(test, variant) && testCanBeRun(test)
        );
        console.log(
            'will a non-compliant variant run?',
            willNonCompliantVariantRun
        );
        return willNonCompliantVariantRun;
    });

    console.log('inClashing', inClashing);
    return inClashing;
};

export { emailTests, contributionsTests };
