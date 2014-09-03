define([
    'bonzo',
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/mediator',
    'common/modules/commercial/dfp'
], function (
    bonzo,
    once,
    $,
    mediator,
    dfp
) {

    var postsCount,
        timedOut,
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
            },
            test: {
                first: {
                    timeout: 10 * 1000,
                    posts: 1
                },
                further: {
                    timeout: 10 * 1000,
                    posts: 1
                }
            }
        },
        reset = function () {
            postsCount = 0;
            timedOut = false;
            window.setInterval(function () {
                timedOut = true;
            }, criteria[state].timeout);
        },
        init = function () {
            criteria = adCriterias.test;
            reset();
            mediator.on('modules:autoupdate:updates', function (updates) {
                postsCount += updates.length;
                if (postsCount >= criteria[state].posts && timedOut) {
                    var displaySlot = adSlotNames.length,
                        // add the first ad slot we haven't already
                        $adSlot = displaySlot ?
                            bonzo(dfp.createAdSlot(adSlotNames.shift(), 'liveblog-inline')) :
                            // otherwise get the ad furthest down the page
                            $('.article-body .ad-slot')
                                .last()
                                .detach();
                    // put the ad slot after the latest post
                    $('.article-body .block:first-child').after($adSlot);
                    if (displaySlot) {
                        dfp.addSlot($adSlot);
                    } else {
                        dfp.refreshSlot($adSlot);
                    }
                    reset();
                    state = 'further';
                }
            });
        };

    return {
        init: once(init)
    };

});
