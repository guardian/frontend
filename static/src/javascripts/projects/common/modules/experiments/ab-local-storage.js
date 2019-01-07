// @flow
import { local } from 'lib/storage';

export const participationsKey = 'gu.ab.participations';

export const getParticipationsFromLocalStorage = (): Participations =>
    local.get(participationsKey) || {};

export const setParticipationsInLocalStorage = (participations: Participations): void => {
    local.set(participationsKey, participations);
};

export const runnableTestsToParticipations = (
    runnableTests: $ReadOnlyArray<Runnable<ABTest>>
): Participations => {
    const participations: Participations = {};
    runnableTests.forEach(({ id: testId, variantToRun }) => {
        participations[testId] = { variant: variantToRun.id };
    });

    return participations;
};

// Wipes all localStorage participations
export const clearParticipations = (): void => {
    local.remove(participationsKey);
};

export const getVariantFromLocalStorage = (test: ABTest): ?Variant => {
    const participationsFromLocalStorage = getParticipationsFromLocalStorage();
    if (participationsFromLocalStorage[test.id]) {
        return test.variants.find(
            variant => variant.id === participationsFromLocalStorage[test.id].variant
        );
    }

    return null;
};

export const saveRunnableTestsToLocalStorage = (
    runnableTests: $ReadOnlyArray<Runnable<ABTest>>
) => {
    const participations = runnableTestsToParticipations(runnableTests);
    setParticipationsInLocalStorage(participations);
};
