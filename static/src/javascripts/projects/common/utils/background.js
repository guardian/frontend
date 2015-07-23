/*
    runs each block on a separate animation frame to prevent excessive lumpiness
 */
define([
    'common/utils/_'
], function (
    _
) {

    return function (codeBlocks) {
        return (_.reduceRight(codeBlocks, function (restFunctions, fn) {
            return function () {
                requestAnimationFrame(function () {
                    fn();
                    restFunctions();
                });
            };
        }, function () {}))();
    };

});
