define([
    'common/utils/_',
    'common/utils/detect',
    'common/utils/config'
], function (
    _,
    detect,
    config
) {

    var browsers = {
            'Firefox': '25',
            'Chrome': '28',
            'IE': '9',
            'Opera': '14',
            'Safari': '7'
        },
        ua = detect.getUserAgent,
        message = 'Please <a href="http://whatbrowser.org" target="_blank">update</a> your browser to watch this video.'

    return function supportedBrowser(player) {
        var notSupported =  _.some(browsers, function(version, browser){
            return (ua.browser === browser && ua.version < version);
        });

        if(notSupported && config.switches.mediaPlayerSupportedBrowsers) {
            player.error(message);
        }
    }
});
