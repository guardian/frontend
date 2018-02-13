// @flow
import { isInTest, variantFor } from 'common/modules/experiments/segment-util';
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
    tests.some(test => {
        const nonCompliantVariants = test.variants.filter(variant => {
            const compliant =
                variant &&
                variant.options &&
                variant.options.isOutbrainCompliant;
            return !compliant;
        });

        console.log('nonCompliantVariants', nonCompliantVariants);
        const inVariant = nonCompliantVariants.some(variant =>
            f(test, variant)
        );
        console.log('any inVariant?', inVariant);
        return inVariant;
    });

export const userIsInAClashingAbTest = (
    tests: $ReadOnlyArray<ABTest> = potentiallyClashingTests
) => {
    const inClashing = testABClash(
        (test: ABTest, variant: Variant) =>
            isInTest(test) && variantFor(test) === variant,
        tests
    );
    console.log('inClashing', inClashing);
    return inClashing;
};

export { emailTests, contributionsTests };
