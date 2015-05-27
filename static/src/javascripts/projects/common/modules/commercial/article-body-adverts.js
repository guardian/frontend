define([
    'fastdom',
    'Promise',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/article/spacefinder',
    'common/modules/commercial/create-ad-slot'
], function (
    fastdom,
    Promise,
    _,
    $,
    config,
    detect,
    spacefinder,
    createAdSlot
) {
    function getRules() {
        return {
            minAbove: detect.isBreakpoint({ max: 'tablet' }) ? 300 : 700,
            minBelow: 300,
            selectors: {
                ' > h2': {minAbove: detect.getBreakpoint() === 'mobile' ? 20 : 0, minBelow: 250},
                ' > *:not(p):not(h2)': {minAbove: 35, minBelow: 400},
                ' .ad-slot': {minAbove: 500, minBelow: 500}
            }
        };
    }

    function getLenientRules() {
        var lenientRules = _.cloneDeep(getRules());
        // more lenient rules, closer to the top start of the article
        lenientRules.minAbove = 300;
        lenientRules.selectors[' > h2'].minAbove = 20;
        return lenientRules;
    }

    function getAdSpace(rules) {
        return spacefinder.getParaWithSpace(rules).then(function (nextSpace) {
            // check if spacefinder found another space
            if (typeof nextSpace === 'undefined') {
                return Promise.resolve(null);
            }

            // if yes add another ad
            adNames.push(['inline2', 'inline']);
            return insertAdAtP(nextSpace).then(function () {
                return getAdSpace(rules);
            });
        });
    }

    var ads = [],
        adNames = [['inline1', 'inline'], ['inline2', 'inline']],
        insertAdAtP = function (para) {
            if (para) {
                var adName = adNames[ads.length],
                    $ad    = $.create(createAdSlot(adName[0], adName[1]));

                ads.push($ad);
                return new Promise(function (resolve) {
                    fastdom.write(function () {
                        $ad.insertBefore(para);
                        resolve(null);
                    });
                });
            } else {
                return Promise.resolve(null);
            }
        },
        init = function () {
            var rules, lenientRules, inlineMercPromise, promises = [];

            // is the switch off, or not an article, or a live blog
            if (
                !config.switches.standardAdverts ||
                    config.page.contentType !== 'Article' ||
                    config.page.isLiveBlog
            ) {
                return false;
            }

            rules = getRules();
            lenientRules = getLenientRules();

            if (config.page.hasInlineMerchandise) {
                adNames.unshift(['im', 'im']);

                inlineMercPromise = spacefinder.getParaWithSpace(lenientRules).then(function (space) {
                    return insertAdAtP(space);
                });
            } else {
                inlineMercPromise = Promise.resolve(null);
            }

            return inlineMercPromise.then(function () {
                return spacefinder.getParaWithSpace(rules).then(function (space) {
                    return insertAdAtP(space);
                }).then(function () {
                    /*if (detect.isBreakpoint({max: 'tablet'})) {
                        return spacefinder.getParaWithSpace(rules).then(function (nextSpace) {
                            console.log("Another space?", nextSpace);
                            return insertAdAtP(nextSpace);
                        })
                    } else {
                        return Promise.resolve(null);
                    }*/

                    return spacefinder.getParaWithSpace(rules).then(function (nextSpace) {
                        return insertAdAtP(nextSpace);
                    }).then(function () {
                        return getAdSpace(rules);                        
                    });
                });
            });
        };

    return {
        init: init,
        // rules exposed for spacefinder debugging
        getRules: getRules,
        getLenientRules: getLenientRules,

        reset: function () {
            ads = [];
        }
    };
});
