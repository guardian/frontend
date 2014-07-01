define([
    'qwery',
    'common/utils/$',
    'common/utils/cookies',
    'common/utils/config',
    'lodash/objects/defaults'
], function (
    qwery,
    $,
    cookies,
    globalConfig,
    defaults
) {

    var nId = '1476',
        cookieName = 'cto2_guardian',
        criteoUrl = '//rtax.criteo.com/delivery/rta/rta.js';


    function getSegments() {
        var result = {};

        if (globalConfig.switches && globalConfig.switches.criteo) {
            var criteoSegmentString = cookies.get(cookieName);
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

    function load(config) {
        config = defaults(
            config || {},
            globalConfig,
            {
                switches: {}
            }
        );

        if (config.switches.criteo) {
            var params = [
                    ['netid', nId],
                    ['cookieName', cookieName],
                    ['rnd', Math.floor(Math.random() * 99999999999)],
                    ['varName', 'crtg_content']
                ]
                    // turn into a query string
                    .map(function (pair) { return pair.join('='); })
                    .join('&');
            return require(['js!' + criteoUrl + '?' + params + '!exports=crtg_content']);
        }
    }

    return {
        load : load,
        getSegments: getSegments
    };

});
