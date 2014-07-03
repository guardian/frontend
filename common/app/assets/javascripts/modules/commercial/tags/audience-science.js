define([
    'common/utils/cookies',
    'common/utils/storage',
    'common/utils/config'
], function(
    cookies,
    storage,
    config
) {

    var revenueScienceUrl = '//js.revsci.net/gateway/gw.js?csid=E05516';

    function getSegments() {
        var segments = storage.local.get('gu.ads.audsci');
        return (segments) ? segments.slice(0, 40) : [];
    }

    function load() {
        if (config.switches.audienceScience) {
            // Audience Science calls these functions on window.
            window.DM_prepClient = function (csid, client) {
                client.DM_addEncToLoc('siteName', '');
                client.DM_addEncToLoc('comFolder', '');
                client.DM_addEncToLoc('mobile', true);

                config.page.audienceScienceData.forEach(function (item) {
                    client.DM_addEncToLoc(item.name, item.value);
                });
            };
            window.DM_onSegsAvailable = function (segments) {
                storage.local.set('gu.ads.audsci', processSegments(segments));
                // Kill any legacy cookies
                cookies.cleanUp(['rsi_segs']);
            };
            // Then load audsci to get latests segments.
            return require(['js!' + revenueScienceUrl + '!exports=rsi_now'], function () {
                window.E05516.DM_tag();
            });
        }
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
