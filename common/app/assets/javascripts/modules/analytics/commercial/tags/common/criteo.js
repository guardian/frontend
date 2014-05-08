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

    function load() {
        if (config.switches.criteo) {
            function crtg_getCookie(a) {
                var b, c, d, e = document.cookie.split(";");
                for (b = 0; b < e.length; b++) {
                    c = e[b].substr(0, e[b].indexOf("="));
                    d = e[b].substr(e[b].indexOf("=") + 1);
                    c = c.replace(/^\s+|\s+$/g, "");
                    if (c == a) {
                        return unescape(d)
                    }
                }
                return""
            }

            var crtg_nid = "1476";
            var crtg_cookiename = "cto2_guardian";
            var crtg_content = crtg_getCookie(crtg_cookiename);
            var crtg_rnd = Math.floor(Math.random() * 99999999999);
            var crtg_url = "http://rtax.criteo.com/delivery/rta/rta.js?netid=" + escape(crtg_nid);
            crtg_url += "&cookieName=" + escape(crtg_cookiename);
            crtg_url += "&rnd=" + crtg_rnd;
            crtg_url += "&varName=crtg_content";
            var crtg_script = document.createElement("script");
            crtg_script.type = "text/javascript";
            crtg_script.src = crtg_url;
            crtg_script.async = true;
            if (document.getElementsByTagName("head").length > 0)document.getElementsByTagName("head")[0].appendChild(crtg_script); else if (document.getElementsByTagName("body").length > 0)document.getElementsByTagName("body")[0].appendChild(crtg_script)
        }
    }

});
