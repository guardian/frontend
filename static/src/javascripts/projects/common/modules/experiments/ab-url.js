// @flow

import { testAndParticipationsToVariant } from './ab-utils';

export const getForcedParticipationsFromUrl = (): Participations => {
    if (window.location.hash.startsWith('#ab')) {
        const tokens = window.location.hash.replace('#ab-', '').split(',');

        return tokens.reduce((obj, token) => {
            const [testId, variantId] = token.split('=');
            return {
                ...obj,
                [testId]: { variant: variantId },
            };
        }, {});
    }

    return {};
};

// If the given test has a variant which is forced by the URL, return it
export const getVariantFromUrl = (test: ABTest): ?Variant =>
    testAndParticipationsToVariant(test, getForcedParticipationsFromUrl());
