/*
    runs each block on a separate animation frame to prevent excessive lumpiness
 */
define([
    'common/utils/_',
    'common/utils/config',
    'common/utils/robust'
], function (
    _,
    config,
    robust
) {

    return function (codeBlocks) {
        var background = config.switches.backgroundJs;
        return (_.reduceRight(codeBlocks, function (restFunctions, fn) {
            return function () {
                if (background) {
                    requestAnimationFrame(function () {
                        restFunctions();
                        fn();
                    });
                } else {
                    robust.catchErrorsAndLog('background', fn);// don't know the real name
                    restFunctions();
                }
            };
        }, function () {}))();
    };

});
