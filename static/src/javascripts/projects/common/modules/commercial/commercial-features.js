define([
    'common/modules/commercial/commercial-feature-policies',
    'lodash/objects/forOwn'
], function (
    commercialFeaturePolicies,
    forOwn) {
    function init() {
        var commercialFeatures = getFeatureSwitches();
        commercialFeatures.reset = init; // Exposed for testing
        return commercialFeatures;
    }

    /**
     * Take the results of all our commercial content policies and smush them together
     * @see commercial-feature-policies.js for the list.
     */
    function getFeatureSwitches() {
        var activeSwitches = {};
        var switchesForPolicies = commercialFeaturePolicies.getPolicySwitches();

        forOwn(switchesForPolicies, function mergeSwitches(policySwitchSet) {
            forOwn(policySwitchSet, function (switchValue, switchKey) {
                var activeValue = activeSwitches[switchKey];
                if (activeValue !== false) {
                    // A policy can only override a true or undefined switch
                    // This gives any policy the ability to veto a commercial feature
                    activeSwitches[switchKey] = switchValue;
                }
            });
        });

        return activeSwitches;
    }

    return init();
});

