// @flow
import config from 'lib/config';
import { local } from 'lib/storage';

const overridesToArray = (
    overrides: Participations
): { testId: string, variantId: string }[] =>
    Object.keys(overrides).map(testId => ({
        testId,
        variantId: overrides[testId].variant,
    }));

const arrayToOverrides = (
    arr: { testId: string, variantId: string }[]
): Participations => {
    const overrides: Participations = {};
    arr.forEach(({ testId, variantId }) => {
        overrides[testId] = { variant: variantId };
    });

    return overrides;
};

const filterOverrides = (
    overrides: Participations,
    filter: ({ testId: string, variantId: string }) => boolean
): Participations => arrayToOverrides(overridesToArray(overrides).filter(filter));

export const overridesKey = 'gu.ab.overrides';

export const getOverridesFromLocalStorage = (): Participations =>
    local.get(overridesKey) || {};

export const setOverridesInLocalStorage = (overrides: Participations): void => {
    local.set(overridesKey, overrides);
};

// Wipes all overrides
export const clearOverrides = (): void => {
    local.remove(overridesKey);
};

export const getOverridesFromUrl = (): Participations => {
    if (window.location.hash.startsWith('#ab')) {
        const tokens = window.location.hash.replace('#ab-', '').split(',');

        const overrides: Participations = {};
        tokens.forEach(token => {
            const [testId, variantId] = token.split('=');
            overrides[testId] = {
                variant: variantId,
            };
        });

        return overrides;
    }

    return {};
};

export const getOverridenVariant = (test: ABTest): ?Variant => {
    const overrides = getOverridesFromLocalStorage();
    if (overrides[test.id]) {
        return test.variants.find(
            variant => variant.id === overrides[test.id].variant
        );
    }

    return null;
};

// You can override the MVT cookie and force participation in a given test variant by
// setting a URL hash. This value is then stored in localStorage and will persist until
// replaced by another override for that test, or until the test switch is deleted from the backend.
export const initManualOverrides = () => {
    const currentOverrides: Participations = getOverridesFromLocalStorage();
    const overridesFromUrl: Participations = getOverridesFromUrl();

    const newOverrides: Participations = {
        ...currentOverrides,
        ...overridesFromUrl,
    };

    const newOverridesWithoutDeletedTestsOrNotInTest: Participations = filterOverrides(
        newOverrides,
        ({ testId, variantId }) =>
            // Don't bother cleaning out the expired tests.
            // The switch will have an expiry too and once that happens the test & switch will be deleted.
            // In the meantime, expired tests will still not run, even through an override. (see testCanBeRun() in ab.js)
            config.get(`switches.ab${testId}`, 'NOT_FOUND') !== 'NOT_FOUND' &&
            // this provides a way to remove an override via the URL hash
            variantId !== 'notintest'
    );

    setOverridesInLocalStorage(newOverridesWithoutDeletedTestsOrNotInTest);
};
