// @flow

import {
    getMvtNumValues,
    getMvtValue,
} from 'common/modules/analytics/mvt-cookie';
import config from 'lib/config';

const isTestSwitchedOn = (test: ABTest): boolean =>
    config.switches[`ab${test.id}`];

const isExpired = (testExpiry: string): boolean => {
    // new Date(test.expiry) sets the expiry time to 00:00:00
    // Using SetHours allows a test to run until the END of the expiry day
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return startOfToday > new Date(testExpiry);
};

const testCanBeRun = (test: ABTest): boolean => {
    const expired = isExpired(test.expiry);
    const isSensitive = config.page.isSensitive;
    const shouldShowForSensitive = !!test.showForSensitive;
    const isTestOn = isTestSwitchedOn(test);
    const canTestBeRun = !test.canRun || test.canRun();

    return (
        (isSensitive ? shouldShowForSensitive : true) &&
        isTestOn &&
        !expired &&
        canTestBeRun
    );
};

/**
 * Determine whether the user is in the test or not and return the associated
 * variant ID.
 *
 * The test population is just a subset of mvt ids. A test population must
 * begin from a specific value. Overlapping test ranges are permitted.
 *
 * @return {String} variant ID
 */
const computeVariantFromMvtCookie = (test: ABTest): ?Variant => {
    const smallestTestId = getMvtNumValues() * test.audienceOffset;
    const largestTestId = smallestTestId + getMvtNumValues() * test.audience;
    const mvtCookieId = Number(getMvtValue());

    if (
        mvtCookieId &&
        mvtCookieId > smallestTestId &&
        mvtCookieId <= largestTestId
    ) {
        // This mvt test id is in the test range, so allocate it to a test variant.
        return test.variants[mvtCookieId % test.variants.length];
    }

    return null;
};

export const runnableTest = (test: ABTest): ?RunnableABTest => {
    const variantToRun = computeVariantFromMvtCookie(test);

    if (testCanBeRun(test) && variantToRun) {
        return {
            ...test,
            variantToRun
        }
    }

    return null;
};

export const allRunnableTests = (tests: ABTest[]): RunnableABTest[] =>
    tests.reduce((accumulator, currentValue) => {
        const rt = runnableTest(currentValue);
        return rt ? [...accumulator, rt] : accumulator;
    }, []);

export const firstRunnableTest = (tests: $ReadOnlyArray<ABTest>): ?RunnableABTest =>
    tests.map(test => runnableTest(test)).find(runnableTest => runnableTest !== null);
