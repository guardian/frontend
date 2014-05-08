define([
    'qwery',
    'common/$',
    'common/utils/cookies',
    'common/utils/config',
    'lodash/objects/pairs'
], function (
    qwery,
    $,
    cookies,
    config,
    _pairs
) {

    var nId = '1476',
        cookieName = 'cto2_guardian',
        criteoScript = 'http://rtax.criteo.com/delivery/rta/rta.js';


    function getSegments() {
        var result = {};

        if (config.switches.criteo) {
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

    function load() {
        if (config.switches.criteo) {
            var params = _pairs({
                    netid: nId,
                    cookieName: cookieName,
                    rnd: Math.floor(Math.random() * 99999999999),
                    varName: 'crtg_content'
                })
                    // turn into a query string
                    .map(function (pair) { return pair.join('='); })
                    .join('&');
            var script = document.createElement('script');
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
