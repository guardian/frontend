define([
    'common/utils/cookies',
    'common/utils/config'
], function (Cookies, config) {

    function addSegments(targeting) {
        if (config.switches.criteo) {
            var criteoSegmentString = Cookies.get('cto2_guardian');
            if (criteoSegmentString !== null) {
                var criteoSegments = decodeURIComponent(criteoSegmentString).split('&');
                criteoSegments.foreach(function (segment) {
                    var segmentKv = segment.split('=');
                    targeting[segmentKv[0]] = segmentKv[1];
                });
            }
        }
    }

    return {
        addSegments: addSegments
    };

});
