define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/dfp',
    'lodash/collections/contains',
    'lodash/functions/debounce',
    'lodash/functions/once'
], function (
    bean,
    bonzo,
    $,
    config,
    mediator,
    createAdSlot,
    dfp,
    contains,
    debounce,
    once) {

    var postsCount,
        timedOut,
        adCriteria,
        // when the the user last interact with the page
        lastInteraction = new Date(),
        interactionWindow = 60 * 1000,
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
            }, adCriteria[state].timeout);
        },
        init = function () {
            if (!config.switches.liveblogAdverts) {
                return false;
            }
            var criteriaType;
            if (config.page.isDev) {
                criteriaType = 'test';
            } else if (contains(config.page.toneIds.split(','), 'tone/minutebyminute')) {
                criteriaType = 'minutebyminute';
            } else {
                criteriaType = 'default';
            }
            adCriteria = adCriterias[criteriaType];
            reset();
            mediator.on('modules:autoupdate:updates', function (updates) {
                postsCount += updates.length;
                if (
                    postsCount >= adCriteria[state].posts &&
                    timedOut &&
                    (new Date() - lastInteraction) < interactionWindow
                ) {
                    var displaySlot = adSlotNames.length,
                        // add the first ad slot we haven't already
                        $adSlot = displaySlot ?
                            bonzo(createAdSlot(adSlotNames.shift(), 'liveblog-inline')) :
                            // otherwise get the ad furthest down the page
                            $('.js-liveblog-body .ad-slot')
                                .last()
                                .detach();
                    // put the ad slot after the latest post
                    $('.js-liveblog-body .block:first-child').after($adSlot);
                    if (displaySlot) {
                        dfp.addSlot($adSlot);
                    } else {
                        dfp.refreshSlot($adSlot);
                    }
                    reset();
                    state = 'further';
                }
            });
            bean.on(document.body, 'mousemove', debounce(function () {
                lastInteraction = new Date();
            }, 200));
        };

    return {
        init: once(init)
    };

});
