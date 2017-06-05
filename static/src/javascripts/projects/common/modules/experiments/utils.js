// @flow
import config from 'lib/config';
import { local } from 'lib/storage';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';

export const participationsKey = 'gu.ab.participations';

export const getParticipations = (): Participations =>
    local.get(participationsKey) || {};

export const setParticipations = (participations: Participations): void => {
    local.set(participationsKey, participations);
};

export const removeParticipation = (toRemove: { id: string }): void => {
    const participations = getParticipations();
    const filteredParticipations = Object.keys(participations)
        .filter(participation => participation !== toRemove.id)
        .reduce((result, input) => {
            Object.assign(result, { [input]: participations[input] });
            return result;
        }, {});
    setParticipations(filteredParticipations);
};

// Removes any tests from localstorage that have been
// renamed/deleted from the backend
export const cleanParticipations = (tests: Array<ABTest>): void =>
    Object.keys(getParticipations()).forEach(k => {
        if (typeof config.switches[`ab${k}`] === 'undefined') {
            removeParticipation({ id: k });
        } else {
            const testExists = tests.some(element => element.id === k);

            if (!testExists) removeParticipation({ id: k });
        }
    });

export const isParticipating = (test: ABTest): boolean =>
    test.id in getParticipations();

export const addParticipation = (test: ABTest, variantId: string): void => {
    const participations = getParticipations();

    participations[test.id] = {
        variant: variantId,
    };

    setParticipations(participations);
};

export const getTestVariantId = (testId: string): ?string => {
    const participation = getParticipations()[testId];
    return participation && participation.variant;
};

export const getVariant = (test: ABTest, variantId: string): ?Variant => {
    const variantIds = test.variants.map(variant => variant.id);
    const index = variantIds.indexOf(variantId);
    return index > -1 ? test.variants[index] : null;
};

export const getAssignedVariant = (test: ABTest): ?Variant => {
    const variantId = getTestVariantId(test.id);
    return variantId ? getVariant(test, variantId) : null;
};

export const setTestVariant = (testId: string, variant: string): void => {
    const participations = getParticipations();

    if (testId in participations) {
        participations[testId].variant = variant;
        setParticipations(participations);
    }
};

/**
 * returns whether the caller should treat the user as being in that variant.
 */
export const isInVariant = (test: ABTest, variant: Variant): boolean =>
    getParticipations()[test.id] &&
    getParticipations()[test.id].variant === variant.id &&
    testCanBeRun(test);

export const getForcedTests = (): Array<{
    testId: string,
    variantId: string,
}> => {
    if (window.location.hash.startsWith('#ab')) {
        const tokens = window.location.hash.replace('#ab-', '').split(',');

        return tokens.map(token => {
            const [testId, variantId] = token.split('=');
            return { testId, variantId };
        });
    }

    return JSON.parse(local.get('gu.devtools.ab') || '[]') || [];
};

export const getForcedVariant = (test: ABTest): ?Variant => {
    const forcedVariantIds: Array<string> = getForcedTests().map(
        t => t.variantId
    );
    return test.variants.find(v => forcedVariantIds.includes(v.id));
};
