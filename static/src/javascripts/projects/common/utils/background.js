/*
    runs each block on a separate animation frame to prevent excessive lumpiness
 */
define([
    'fastdom',
    'common/utils/_',
    'common/utils/config',
    'common/utils/robust'
], function (
    fastdom,
    _,
    config,
    robust
) {

    return function (codeBlocks) {
        var background = config.switches.backgroundJs;
        return (_.reduceRight(codeBlocks, function (restFunctions, fn) {
            return function () {
                if (background) {
                    setTimeout(function () {
                        restFunctions();
                        fn();
                    }, 1);
                } else {
                    robust.catchErrorsAndLog('background', fn);// don't know the real name
                    restFunctions();
                }
            };
        }, function () {}))();
    };

});
