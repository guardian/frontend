// @flow

import {
    getMvtNumValues,
    getMvtValue,
} from 'common/modules/analytics/mvt-cookie';
import config from 'lib/config';
import { isExpired } from 'lib/time-utils';
import { getOverridenVariant } from 'common/modules/experiments/ab-overrides';

const isTestSwitchedOn = (test: ABTest): boolean =>
    config.get(`switches.ab${test.id}`, false);

// We only take account of a variant's canRun function if it's defined.
// If it's not, assume the variant can be run.
const variantCanBeRun = (variant: Variant): boolean =>
    !(variant.canRun && !variant.canRun());

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

export const runnableTest = <T: ABTest>(test: T): ?Runnable<T> => {
    const overridenVariant = getOverridenVariant(test);
    const variantFromCookie = computeVariantFromMvtCookie(test);
    const variantToRun = overridenVariant || variantFromCookie;

    if (testCanBeRun(test) && variantToRun && variantCanBeRun(variantToRun)) {
        return {
            ...test,
            variantToRun,
        };
    }

    return null;
};

export const allRunnableTests = <T: ABTest>(
    tests: $ReadOnlyArray<T>
): $ReadOnlyArray<Runnable<T>> =>
    tests.reduce((accumulator, currentValue) => {
        const rt = runnableTest(currentValue);
        return rt ? [...accumulator, rt] : accumulator;
    }, []);

export const firstRunnableTest = <T: ABTest>(
    tests: $ReadOnlyArray<T>
): ?Runnable<T> =>
    tests
        .map((test: T) => runnableTest(test))
        .find((rt: ?Runnable<T>) => rt !== null);

export const isInVariant = (test: ABTest, variant: Variant): boolean => {
    const rt = runnableTest(test);
    if (!rt) {
        return false;
    }
    return rt.variantToRun.id === variant.id;
};

export const getVariant = (test: ABTest, variantId: string): ?Variant => {
    const variantIds = test.variants.map(variant => variant.id);
    const index = variantIds.indexOf(variantId);
    return index > -1 ? test.variants[index] : null;
};
