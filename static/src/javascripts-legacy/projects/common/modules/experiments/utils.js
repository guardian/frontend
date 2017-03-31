define([
    'lib/storage',
    'common/modules/experiments/test-can-run-checks'
], function (
    store,
    testCanRunChecks
) {
    var participationsKey = 'gu.ab.participations';

    function getParticipations() {
        return store.local.get(participationsKey) || {};
    }

    function setParticipations(participations) {
        store.local.set(participationsKey, participations);
    }

    function isParticipating(test) {
        return test.id in getParticipations();
    }

    function addParticipation(test, variantId) {
        var participations = getParticipations();
        participations[test.id] = {
            variant: variantId
        };
        setParticipations(participations);
    }

    function removeParticipation(test) {
        var participations = getParticipations();
        var filteredParticipations = Object.keys(participations)
            .filter(function (participation) {
                return participation !== test.id;
            })
            .reduce(function (result, input) {
                result[input] = participations[input];
                return result;
            }, {});
        setParticipations(filteredParticipations);
    }

    function getTestVariantId(testId) {
        var participation = getParticipations()[testId];
        return participation && participation.variant;
    }

    function getVariant(test, variantId) {
        var variantIds = test.variants.map(function (variant) {
            return variant.id;
        });
        var index = variantIds.indexOf(variantId);
        return index > -1 ? test.variants[index] : null;
    }

    function setTestVariant(testId, variant) {
        var participations = getParticipations();

        if (testId in participations) {
            participations[testId].variant = variant;
            setParticipations(participations);
        }
    }

    /**
     * returns whether the caller should treat the user as being in that variant.
     *
     * @param testName
     * @param variant
     * @returns {*|boolean|Boolean}
     */
    function isInVariant(test, variant) {
        return getParticipations()[test.name] &&
            getParticipations()[test.name].variant === variant &&
            testCanRunChecks.testCanBeRun(test.name);
    }

    return {
        getParticipations: getParticipations,
        setParticipations: setParticipations,
        isParticipating: isParticipating,
        addParticipation: addParticipation,
        removeParticipation: removeParticipation,
        getTestVariantId: getTestVariantId,
        getVariant: getVariant,
        setTestVariant: setTestVariant,
        isInVariant: isInVariant,
        testCanBeRun: testCanRunChecks.testCanBeRun
    };
});
