define([
    'lodash/objects/defaults',
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/commercial/dfp',
    'common/modules/article/spacefinder'
], function (
    defaults,
    once,
    $,
    globalConfig,
    detect,
    dfp,
    spacefinder
    ) {

    var ads = [],
        insertAdAtP = function(para) {
            if (para) {
                var $ad = $.create(dfp.createAdSlot('inline' + (ads.length + 1), 'inline'))
                    .insertBefore(para);
                ads.push($ad);
            }
        },
        init = function(c) {

            var config = defaults(
                    c || {},
                globalConfig,
                {
                    switches: {}
                }
            );

            // is the switch off, or not an article, or a live blog
            if (!config.switches.standardAdverts || config.page.contentType !== 'Article') {
                return false;
            }

            var breakpoint  = detect.getBreakpoint(),
                rules = {
                    minAbove: (/mobile|tablet/).test(breakpoint) ? 300 : 700,
                    minBelow: 300,
                    selectors: {
                        ' > h2': {minAbove: breakpoint === 'mobile' ? 20 : 0, minBelow: 250},
                        ' > *:not(p):not(h2)': {minAbove: 25, minBelow: 250},
                        ' .ad-slot': {minAbove: 500, minBelow: 500}
                    }
                };

            if ((/wide|desktop|tablet/).test(breakpoint)) {
                insertAdAtP(spacefinder.getParaWithSpace(rules));
                if (window.innerWidth < 900) {
                    insertAdAtP(spacefinder.getParaWithSpace(rules));
                }
            } else {
                insertAdAtP(spacefinder.getParaWithSpace(rules));
                insertAdAtP(spacefinder.getParaWithSpace(rules));
            }
        };

    return {

        init: once(init),

        destroy: function() {
            ads.forEach(function($ad) {
                $ad.remove();
            });
        },

        // for testing
        reset: function() {
            ads = [];
            this.init = once(init);
        }

    };
});
