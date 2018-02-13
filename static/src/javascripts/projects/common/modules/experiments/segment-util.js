// @flow
import memoize from 'lodash/functions/memoize';
import {
    getMvtNumValues,
    getMvtValue,
} from 'common/modules/analytics/mvt-cookie';
import {getParticipations} from "common/modules/experiments/utils";
import {testCanBeRun} from "common/modules/experiments/test-can-run-checks";

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

export const variantFor = (test: ABTest): ?Variant => {
    const variantId = variantIdFor(test);
    return test.variants.find(variant => variant.id === variantId);
};

export const isInTest = (test: ABTest): boolean =>
    variantIdFor(test) !== NOT_IN_TEST;

export const isInVariant = (test: ABTest, variant: Variant): boolean =>
    isInTest(test) && variantFor(test) === variant;
