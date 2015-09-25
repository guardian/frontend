define([
    'common/utils/_',
    'common/modules/commercial/commercial-feature-policies'
], function (
    _,
    commercialFeaturePolicies
) {
    function init() {
        var commercialFeatures = getFeatureSwitches();
        commercialFeatures._init = init; // Exposed for testing
        return commercialFeatures;
    }

    function getFeatureSwitches () {
        // Take the results of all our commercial content policies and smush them together

        var activeSwitches = {};
        var switchesForPolicies = commercialFeaturePolicies.getPolicySwitches();

        _.forOwn(switchesForPolicies, function mergeSwitches(policySwitchSet) {
            _.forOwn(policySwitchSet, function (switchValue, switchKey) {
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

