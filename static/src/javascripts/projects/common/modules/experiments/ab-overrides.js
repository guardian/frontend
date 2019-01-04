// @flow
import config from 'lib/config';
import { local } from 'lib/storage';

const overridesToArray = (
    overrides: Overrides
): { testId: string, variantId: string }[] =>
    Object.keys(overrides).map(testId => ({
        testId,
        variantId: overrides[testId].variant,
    }));

const arrayToOverrides = (
    arr: { testId: string, variantId: string }[]
): Overrides => {
    const overrides: Overrides = {};
    arr.forEach(({ testId, variantId }) => {
        overrides[testId] = { variant: variantId };
    });

    return overrides;
};

const filterOverrides = (
    overrides: Overrides,
    filter: ({ testId: string, variantId: string }) => boolean
): Overrides => arrayToOverrides(overridesToArray(overrides).filter(filter));

export const overridesKey = 'gu.ab.overrides';

export const getOverridesFromLocalStorage = (): Overrides =>
    local.get(overridesKey) || {};

export const setOverridesInLocalStorage = (overrides: Overrides): void => {
    local.set(overridesKey, overrides);
};

// Wipes all overrides
export const clearOverrides = (): void => {
    local.remove(overridesKey);
};

export const getOverridesFromUrl = (): Overrides => {
    if (window.location.hash.startsWith('#ab')) {
        const tokens = window.location.hash.replace('#ab-', '').split(',');

        const overrides: Overrides = {};
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
    const currentOverrides: Overrides = getOverridesFromLocalStorage();
    const overridesFromUrl: Overrides = getOverridesFromUrl();

    const newOverrides: Overrides = {
        ...currentOverrides,
        ...overridesFromUrl,
    };

    const newOverridesWithoutDeletedTestsOrNotInTest: Overrides = filterOverrides(
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
