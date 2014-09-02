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
        adTimeout,
        criteria,
        state = 'first',
        adCriterias = {
            minutebyminute: {
                first: {
                    timeout: 2 * 60 * 1000,
                    posts: 2
                },
                further: {
                    timeout: 5 * 60 * 1000,
                    posts: 5
                }
            },
            'default': {
                first: {
                    timeout: 2 * 60 * 1000,
                    posts: 1
                },
                further: {
                    timeout: 5 * 60 * 1000,
                    posts: 5
                }
            }
        },
        reset = function () {
            postsCount = 0;
            adTimeout = false;
            window.setInterval(function () {
                adTimeout = true;
            }, criteria[state].timeout);
        },
        init = function () {
            criteria = adCriterias['default'];
            reset();
            mediator.on('modules:autoupdate:updates', function (updates) {
                postsCount += updates.length;
                if (postsCount >= criteria[state].posts && adTimeout) {
                    // add the ad
                    $('.article-body .block')
                        .after(dfp.createAdSlot('inline1', 'liveblog-inline'));
                    reset();
                }
                state = 'further';
            });
        };

    return {
        init: once(init)
    };

});
