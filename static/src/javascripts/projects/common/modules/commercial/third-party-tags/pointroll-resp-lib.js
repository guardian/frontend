/**
 * PointRoll resp.lib.js
 *
 * Created by Joe Brust
 * Last edited 5/11/15 r00
 *
 * Notes - Updated window.console check to include dir, info, and warn
 *
 * Sourced from: http://speed.pointroll.com/PointRoll/Media/Asset/RespLib/201296/resp.lib.js
 */

define([
    'common/utils/config'
], function (
    config
) {
    function load() {
        if (config.switches.pointroll) {
            return require(['js!' + '//speed.pointroll.com/PointRoll/Media/Asset/RespLib/201296/resp.lib.js']);
        }
    }

    return {
        load: load
    };

});
