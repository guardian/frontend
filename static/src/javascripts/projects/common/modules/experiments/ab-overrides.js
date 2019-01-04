// @flow
import config from 'lib/config';
import { local } from 'lib/storage';


const filterOutDeletedTests = (overrides: Overrides): Overrides => {
    const nonDeletedTestIds = Object.keys(overrides).filter(
        testId => config.get(`ab${testId}`, 'NOT_FOUND') !== 'NOT_FOUND'
    );

    const nonDeletedOverrides = {};
    nonDeletedTestIds.forEach(testId => {
        nonDeletedOverrides[testId] = overrides[testId].variant;
    });

    return nonDeletedOverrides;
};

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
                variant: variantId
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

    // Don't bother cleaning out the expired tests.
    // The switch will have an expiry too and once that happens the test & switch will be deleted.
    // In the meantime, expired tests will still not run, even through an override. (see testCanBeRun() in ab.js)
    const newOverridesWithoutDeletedTests: Overrides = filterOutDeletedTests(
        newOverrides
    );

    setOverridesInLocalStorage(newOverridesWithoutDeletedTests);
};
