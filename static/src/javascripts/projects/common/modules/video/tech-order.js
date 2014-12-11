define([
    'common/utils/config'
], function (
    config
) {
    var playerPriority = ['html5', 'flash'];

    if (config.switches.prioritiseFlashVideoPlayer) {
        playerPriority = ['flash', 'html5'];
    }

    return playerPriority;
});
