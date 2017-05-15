// @flow
import type { ABTest, Variant } from 'common/modules/experiments/ab-types';

import memoize from 'lodash/functions/memoize';
import * as mvtCookie from 'common/modules/analytics/mvt-cookie';

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
    const smallestTestId = mvtCookie.getMvtNumValues() * test.audienceOffset;
    const largestTestId =
        smallestTestId + mvtCookie.getMvtNumValues() * test.audience;
    const mvtCookieId = Number(mvtCookie.getMvtValue());

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

export const isInTest = (test: ABTest): boolean =>
    variantIdFor(test) !== NOT_IN_TEST;

export const variantFor = (test: ABTest): Variant => {
    const variantId = variantIdFor(test);
    return test.variants.filter(variant => variant.id === variantId)[0];
};
