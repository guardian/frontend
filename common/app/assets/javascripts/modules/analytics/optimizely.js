define(function() {

    function readTests(config) {
        var tests = [];
        var prop = '';
        if (window.optimizely) {
            var optim = window.optimizely;
            for (var i = 0, j = optim.activeExperiments.length; i<j; ++i) {
                var experimentId = optim.activeExperiments[i];
                var activeVariantId = optim.variationIdsMap[experimentId][0];
                prop += optim.allExperiments[experimentId].name + '#' + experimentId + '=';
                prop += optim.allVariations[activeVariantId].name + '#' + activeVariantId;
                if (i >= optim.activeExperiments.length) {
                    prop += "|||";
                }
            }
        }
        return prop;
    }

    return {
        'readTests': readTests
    };
});

