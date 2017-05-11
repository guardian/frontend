import store from 'lib/storage';
import testCanRunChecks from 'common/modules/experiments/test-can-run-checks';
const participationsKey = 'gu.ab.participations';

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
    const participations = getParticipations();
    participations[test.id] = {
        variant: variantId
    };
    setParticipations(participations);
}

function removeParticipation(test) {
    const participations = getParticipations();
    const filteredParticipations = Object.keys(participations)
        .filter(participation => participation !== test.id)
        .reduce((result, input) => {
            result[input] = participations[input];
            return result;
        }, {});
    setParticipations(filteredParticipations);
}

function getTestVariantId(testId) {
    const participation = getParticipations()[testId];
    return participation && participation.variant;
}

function getVariant(test, variantId) {
    const variantIds = test.variants.map(variant => variant.id);
    const index = variantIds.indexOf(variantId);
    return index > -1 ? test.variants[index] : null;
}

function setTestVariant(testId, variant) {
    const participations = getParticipations();

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
    return getParticipations()[test.id] &&
        getParticipations()[test.id].variant === variant.id &&
        testCanRunChecks.testCanBeRun(test);
}

export default {
    getParticipations,
    setParticipations,
    isParticipating,
    addParticipation,
    removeParticipation,
    getTestVariantId,
    getVariant,
    setTestVariant,
    isInVariant,
    testCanBeRun: testCanRunChecks.testCanBeRun
};
