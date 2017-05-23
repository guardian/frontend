// @flow
import {
    getActiveTests,
    getTest,
    TESTS,
} from 'common/modules/experiments/ab-tests';
import { buildOphanSubmitter } from 'common/modules/experiments/ab-ophan';
import {
    isInTest,
    variantIdFor,
} from 'common/modules/experiments/segment-util';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';
import {
    isParticipating,
    getParticipations,
    getVariant,
    addParticipation,
    getTestVariantId,
    cleanParticipations,
    getForcedTests,
} from 'common/modules/experiments/utils';

const noop = (): null => null;

// Finds variant in specific tests and runs it
const runTest = (test: ABTest): void => {
    if (isParticipating(test) && testCanBeRun(test)) {
        const participations = getParticipations();
        const variantId = participations[test.id].variant;
        const variant = getVariant(test, variantId);

        if (variant) {
            variant.test(variant.options || {});
        } else if (!isInTest(test) && test.notInTest) {
            test.notInTest();
        }
    }
};

const allocateUserToTest = test => {
    // Only allocate the user if the test is valid and they're not already participating.
    if (testCanBeRun(test) && !isParticipating(test)) {
        addParticipation(test, variantIdFor(test));
    }
};

export const shouldRunTest = (testId: string, variantName: string) => {
    const test = getTest(testId);

    return (
        test &&
        isParticipating(test) &&
        getTestVariantId(testId) === variantName &&
        testCanBeRun(test)
    );
};

export const segment = (tests: Array<ABTest>) =>
    tests.forEach(allocateUserToTest);

export const forceSegment = (testId: string, variantName: string) => {
    const test: ?ABTest = getActiveTests().find(t => t.id === testId);
    if (test) addParticipation(test, variantName);
};

export const forceVariantCompleteFunctions = (
    testId: string,
    variantId: string
) => {
    const test = getTest(testId);

    if (test) {
        const variant =
            test &&
            test.variants.filter(
                v => v.id.toLowerCase() === variantId.toLowerCase()
            )[0];
        const impression = (variant && variant.impression) || noop;
        const complete = (variant && variant.success) || noop;

        impression(buildOphanSubmitter(test, variantId, false));
        complete(buildOphanSubmitter(test, variantId, true));
    }
};

export const segmentUser = () => {
    const forcedIntoTests = getForcedTests();

    if (forcedIntoTests.length) {
        forcedIntoTests.forEach(test => {
            forceSegment(test.testId, test.variantId);
            forceVariantCompleteFunctions(test.testId, test.variantId);
        });
    } else {
        segment(getActiveTests());
    }

    cleanParticipations(TESTS);
};

export const run = (tests: Array<ABTest>) => tests.forEach(runTest);
