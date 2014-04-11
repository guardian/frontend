define([
    'common/utils/cookies',
    'common/utils/config'
], function (Cookies, config) {

    function getSegments() {
        var result = {};

        if (config.switches.criteo) {
            var criteoSegmentString = Cookies.get('cto2_guardian');
            if (criteoSegmentString !== null) {
                var criteoSegments = decodeURIComponent(criteoSegmentString).split('&');
                criteoSegments.forEach(function (segment) {
                    var segmentKv = segment.split('=');
                    result[segmentKv[0]] = segmentKv[1];
                });
            }
        }

        return result;
    }

    return {
        getSegments: getSegments
    };

});
