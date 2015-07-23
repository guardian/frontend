/*
    Swallows (and reports) exceptions. Designed to wrap around modules at the "bootstrap" level.
    For example "comments throwing an exception should not stop auto refresh"
 */
define([
    'common/utils/_'
], function (
    _
) {

    (function (codeBlocks) {
        return _.reduceRight(codeBlocks, function (restFunctions, fn) {
            return function () {
                requestAnimationFrame(function () {
                    fn();
                    restFunctions();
                });
            };
        }, function () {});
    })();

});
