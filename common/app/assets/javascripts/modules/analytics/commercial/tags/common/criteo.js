define([
    'qwery',
    'common/$',
    'common/utils/cookies',
    'common/utils/config',
    'lodash/objects/defaults'
], function (
    qwery,
    $,
    cookies,
    globalConfig,
    _defaults
) {

    var nId = '1476',
        cookieName = 'cto2_guardian',
        criteoScript = 'http://rtax.criteo.com/delivery/rta/rta.js';


    function getSegments() {
        var result = {};

        if (globalConfig.switches.criteo) {
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
        config = _defaults(
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
            var script = document.createElement('script');
            script.className = 'criteo-script';
            script.type = 'text/javascript';
            script.src = criteoScript + '?' + params;
            script.async = true;
            $('head').append(script);
            return script;
        } else {
            return null;
        }
    }

    return {
        load : load,
        getSegments: getSegments
    };

});
