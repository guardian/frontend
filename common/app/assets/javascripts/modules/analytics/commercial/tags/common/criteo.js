define([
    'common/utils/cookies'
], function (Cookies) {

    function addSegments(config, targeting) {
        if (config.switches.criteo) {
            var criteoSegmentString = Cookies.get('cto2_guardian');
            if (criteoSegmentString !== null) {
                var criteoSegments = decodeURIComponent(criteoSegmentString).split('&');
                for (var i = 0; i < criteoSegments.length; i++) {
                    var segmentKv = criteoSegments[i].split('=');
                    targeting[segmentKv[0]] = segmentKv[1];
                }
            }
        }
    }

    return {
        addSegments: addSegments
    };

});
