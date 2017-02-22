define([
    'common/utils/config',
    'videojs',
    'videojs-ima',
    'videojs-embed',
    'videojs-persistvolume',
    'videojs-playlist'
], function (config, video) {
    // #wp-rjs
    // In rjs this module is shimmed in the config
    // https://github.com/guardian/frontend/blob/webpack-redux/tools/__tasks__/compile/javascript/rjs.config.js#L42
    // We can move this up to the define() when we go 100% WP
    require('videojs-ads-lib');

    return video;
});
