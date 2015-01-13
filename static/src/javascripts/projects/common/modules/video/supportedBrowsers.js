define([
    'common/utils/_',
    'common/utils/detect'
], function (
    _,
    detect
) {

    var browsers = {
        'Firefox': '25',
        'Chrome': '30',
        'IE': '9',
        'Opera': '14'
        },
        ua = detect.getUserAgent,
        message = 'Please <a href="http://whatbrowser.org" target="_blank">update</a> your browser to watch this video.'

    return function supportedBrowser(player) {
        var notSupported =  _.some(browsers, function(version, browser){
            return (ua.browser === browser && ua.version < version);
        });

        if(notSupported) {
            player.error(message);
        }
    }
});
