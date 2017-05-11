// @flow
import type { ABTest } from 'common/modules/experiments/ab-types';

import {
    getActiveTests,
    getTest,
    TESTS,
} from 'common/modules/experiments/ab-tests';
import { buildOphanSubmitter } from 'common/modules/experiments/ab-ophan';
import segmentUtil from 'common/modules/experiments/segment-util';
import * as testCanRunChecks
    from 'common/modules/experiments/test-can-run-checks';
import * as abUtils from 'common/modules/experiments/utils';
import config from 'lib/config';
import { local } from 'lib/storage';

const noop = (): null => null;

// Removes any tests from localstorage that have been
// renamed/deleted from the backend
const cleanParticipations = (): void =>
    Object.keys(abUtils.getParticipations()).forEach(k => {
        if (typeof config.switches[`ab${k}`] === 'undefined') {
            abUtils.removeParticipation({
                id: k,
            });
        } else {
            const testExists = TESTS.some(element => element.id === k);

            if (!testExists) {
                abUtils.removeParticipation({
                    id: k,
                });
            }
        }
    });

// Finds variant in specific tests and runs it
const runTest = test => {
    if (abUtils.isParticipating(test) && testCanRunChecks.testCanBeRun(test)) {
        const participations = abUtils.getParticipations();
        const variantId = participations[test.id].variant;
        const variant = abUtils.getVariant(test, variantId);

        if (variant) {
            variant.test();
        } else if (!segmentUtil.isInTest(test) && test.notInTest) {
            test.notInTest();
        }
    }
};

const allocateUserToTest = test => {
    // Only allocate the user if the test is valid and they're not already participating.
    if (testCanRunChecks.testCanBeRun(test) && !abUtils.isParticipating(test)) {
        abUtils.addParticipation(test, segmentUtil.variantIdFor(test));
    }
};

export const shouldRunTest = (id: string, variant: string) => {
    const test = getTest(id);

    return (
        test &&
        abUtils.isParticipating(test) &&
        abUtils.getTestVariantId(id) === variant &&
        testCanRunChecks.testCanBeRun(test)
    );
};

const getForcedIntoTests = () => {
    if (/^#ab/.test(window.location.hash)) {
        const tokens = window.location.hash.replace('#ab-', '').split(',');

        return tokens.map(token => {
            const abParam = token.split('=');

            return {
                id: abParam[0],
                variant: abParam[1],
            };
        });
    }

    return JSON.parse(local.get('gu.devtools.ab')) || [];
};

export const segment = () =>
    getActiveTests().forEach(test => {
        allocateUserToTest(test);
    });

export const forceSegment = (testId: string, variant: string) => {
    getActiveTests().filter(test => test.id === testId).forEach(test => {
        abUtils.addParticipation(test, variant);
    });
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
    const forcedIntoTests = getForcedIntoTests();

    if (forcedIntoTests.length) {
        forcedIntoTests.forEach(test => {
            forceSegment(test.id, test.variant);
            forceVariantCompleteFunctions(test.id, test.variant);
        });
    } else {
        segment();
    }

    cleanParticipations();
};

export const run = () => getActiveTests().forEach(runTest);

/**
 * check if a test can be run (i.e. is not expired and switched on)
 */
export const testCanBeRun = (test: string | ABTest) => {
    if (typeof test === 'string') {
        const testObj = getTest(test);
        return testObj && testCanRunChecks.testCanBeRun(testObj);
    }

    return test.id && test.expiry && testCanRunChecks.testCanBeRun(test);
};

// export const _ = {
//     reset: () => {
//         TESTS = [];
//         segmentUtil.variantIdFor.cache = {};
//     },
// };
