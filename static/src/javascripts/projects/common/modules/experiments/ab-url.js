// @flow

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

export const getVariantFromUrl = (test: ABTest): ?Variant => {
    const forcedParticipationsFromUrl = getForcedParticipationsFromUrl();
    if (forcedParticipationsFromUrl[test.id]) {
        return test.variants.find(
            variant => variant.id === forcedParticipationsFromUrl[test.id].variant
        );
    }

    return null;
};
