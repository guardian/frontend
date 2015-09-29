/*
    used to run each block on a separate timeout to prevent excessive lumpiness, however caused interleaving
    of code that depended on each other (most popular didn't work)
 */
define([
    'common/utils/_'
], function (
    _
) {

    return function (codeBlocks) {
        _.forEach(codeBlocks, function (fn) {
            fn()
        });
    };

});
