define(['modules/cookies'], function(Cookies) {

    var revenueScienceUrl = "js!http://js.revsci.net/gateway/gw.js?csid=E05516";

    function getSegments() {
        var segments = localStorage.getItem("gu.ads.audsci");
        if (segments) {
            return JSON.parse(segments);
        } else {
            return [];
        }
    }

    function load(config) {
        // Audience Science calls these functions on window.
        window.DM_prepClient = function(csid, client) {
            client.DM_addEncToLoc('siteName', "");
            client.DM_addEncToLoc('comFolder', "");

            if(config.audienceScienceData) {
                for(var i = 0, j = config.audienceScienceData.length; i<j; ++i) {
                    var item = config.audienceScienceData[i];
                    client.DM_addEncToLoc(item.name, item.value);
                }
            }
        };
        window.DM_onSegsAvailable = function(segments, id) {
            segments = processSegments(segments);
            localStorage.setItem("gu.ads.audsci", JSON.stringify(segments));
            // Kill any legacy cookies
            Cookies.cleanUp(["rsi_segs"]);
        };
        // Then load audsci to get latests segments.
        require([revenueScienceUrl], function() {
            window.E05516.DM_tag();
        });
    }

    // This is replicating what Audience Science do when they set a cookie.
    // For some reason they don't do it to segments passed in the onSegsAvailable callback.
    function processSegments(segments) {
        var pSegs = [];
        var pat = /.*_5.*/;
        var pat2 = /([^_]{2})[^_]*_(.*)/;
        for (var i = 0, x = segments.length; i < x && i < 100; ++i) {
            if (!pat.test(segments[i])) {
                var f = pat2.exec(segments[i]);
                if (f!==null) {
                    pSegs.push(f[1] + f[2]);
                    ++i;
                }
            }
        }
        return pSegs;
    }

    return {
        getSegments: getSegments,
        load: load
    };

});
