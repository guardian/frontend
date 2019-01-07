// @flow

import { NOT_IN_TEST } from 'common/modules/experiments/ab-constants';
import {
    filterParticipations,
    variantFromParticipations,
} from 'common/modules/experiments/ab-local-storage';

const getForcedParticipationsFromUrl = (): Participations => {
    if (window.location.hash.startsWith('#ab')) {
        const tokens = window.location.hash.replace('#ab-', '').split(',');

        const forcedParticipations: Participations = {};
        tokens.forEach(token => {
            const [testId, variantId] = token.split('=');
            forcedParticipations[testId] = {
                variant: variantId,
            };
        });

        return forcedParticipations;
    }

    return {};
};

export const getVariantFromUrl = (test: ABTest): ?Variant =>
    variantFromParticipations(test, getForcedParticipationsFromUrl());

export const getNotInTestsFromUrl = (): Participations =>
    filterParticipations(
        getForcedParticipationsFromUrl(),
        ({ variantId }) => variantId === NOT_IN_TEST
    );
