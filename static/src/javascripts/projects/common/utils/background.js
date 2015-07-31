/*
    runs each block on a separate animation frame to prevent excessive lumpiness
 */
define([
    'fastdom',
    'common/utils/_',
    'common/utils/config'
], function (
    fastdom,
    _,
    config
) {

    return function (codeBlocks) {
        var background = config.switches.backgroundJs;
        (_.reduceRight(codeBlocks, function (restFunctions, fn) {
            return function () {
                var link = function () {
                    fn();
                    restFunctions();
                };
                if (background) {
                    setTimeout(link, 1);
                } else {
                    link();
                }
            };
        }, function () {}))();
    };

});
