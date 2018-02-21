// @flow
import memoize from 'lodash/functions/memoize';
import {getMvtNumValues, getMvtValue,} from 'common/modules/analytics/mvt-cookie';
import {testCanBeRun} from "common/modules/experiments/test-can-run-checks";
import {local} from "../../../../lib/storage";

const NOT_IN_TEST = 'notintest';

const getId = test => test.id; // use test ids as memo cache keys

/**
 * Determine whether the user is in the test or not and return the associated
 * variant ID.
 *
 * The test population is just a subset of mvt ids. A test population must
 * begin from a specific value. Overlapping test ranges are permitted.
 *
 * @return {String} variant ID
 */
const computeVariantIdFor = (test: ABTest): string => {
    const smallestTestId = getMvtNumValues() * test.audienceOffset;
    const largestTestId = smallestTestId + getMvtNumValues() * test.audience;
    const mvtCookieId = Number(getMvtValue());

    if (
        mvtCookieId &&
        mvtCookieId > smallestTestId &&
        mvtCookieId <= largestTestId
    ) {
        // This mvt test id is in the test range, so allocate it to a test variant.
        const variantIds = test.variants.map(getId);

        return variantIds[mvtCookieId % variantIds.length];
    }

    return NOT_IN_TEST;
};

export const variantIdFor = memoize(computeVariantIdFor, getId);

export const getForcedTests = (): Array<{
    testId: string,
    variantId: string,
}> => {
    if (window.location.hash.startsWith('#ab')) {
        const tokens = window.location.hash.replace('#ab-', '').split(',');

        return tokens.map(token => {
            const [testId, variantId] = token.split('=');
            return {testId, variantId};
        });
    }

    return JSON.parse(local.get('gu.experiments.ab') || '[]') || [];
};

export const getForcedVariant = (test: ABTest): ?Variant => {
    const forcedVariantIds: Array<string> = getForcedTests().map(
        t => t.variantId
    );
    return test.variants.find(v => forcedVariantIds.includes(v.id));
};

export const isInTest = (test: ABTest): boolean => {
    if (!testCanBeRun(test)) {
        return false;
    }

    if (getForcedTests().some(t => t.testId === test.id)) {
        return true;
    }

    return variantIdFor(test) !== NOT_IN_TEST;
};

export const variantFor = (test: ABTest): ?Variant => {
    if (!testCanBeRun(test)) {
        return;
    }

    const forcedVariant = getForcedVariant(test);

    if (forcedVariant) {
        return forcedVariant;
    }

    const variantId = variantIdFor(test);
    return test.variants.find(variant => variant.id === variantId);
};
