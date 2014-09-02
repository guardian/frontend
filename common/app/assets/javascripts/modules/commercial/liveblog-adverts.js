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
        adSlotNames = ['inline1', 'inline2'],
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
                    var adSlotName = adSlotNames.shift(),
                        // add the first ad slot we haven't already
                        adSlot = adSlotName ?
                            dfp.createAdSlot(adSlotName, 'liveblog-inline') :
                            // otherwise get the ad furthest down the page
                            $('.article-body .ad-slot')
                                .last()
                                .detach();
                    // put the ad slot after the latest post
                    $('.article-body .block:first-child').after(adSlot);
                    reset();
                }
                state = 'further';
            });
        };

    return {
        init: once(init)
    };

});
