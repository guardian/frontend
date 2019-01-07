// @flow

import { NOT_IN_TEST } from 'common/modules/experiments/ab-constants';
import {
    filterParticipations,
    variantFromParticipations,
} from 'common/modules/experiments/ab-local-storage';

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
    variantFromParticipations(test, getForcedParticipationsFromUrl());

export const getTestExclusionsFromUrl = (): Participations =>
    filterParticipations(
        getForcedParticipationsFromUrl(),
        ({ variantId }) => variantId === NOT_IN_TEST
    );
