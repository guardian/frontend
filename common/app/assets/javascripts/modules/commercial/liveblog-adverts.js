define([
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/mediator',
    'common/modules/commercial/dfp'
], function (
    once,
    $,
    mediator,
    dfp
) {

    var postsCount,
        adTimeout;
        reset = function () {
            postsCount = 0;
            adTimeout = false;
            window.setInterval(function () {
                adTimeout = true;
            }, 10 * 1000);
        },
        init = function (c) {
            reset();
            mediator.on('modules:autoupdate:updates', function (updates) {
                postsCount += updates.length;
                console.log(postsCount);
                console.log(adTimeout);
                if (postsCount >= 1 && adTimeout) {
                    // add an ad
                    $('.article-body').prepend(dfp.createAdSlot('inline1', 'liveblog-inline'));
                    reset();
                }
            });
        };

    return {
        init: once(init)
    };

});
