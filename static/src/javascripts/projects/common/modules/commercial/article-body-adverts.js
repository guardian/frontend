define([
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/fastdom-idle',
    'common/modules/article/spacefinder',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features',
    'lodash/objects/cloneDeep'
], function (
    Promise,
    $,
    config,
    detect,
    idleFastdom,
    spacefinder,
    createAdSlot,
    commercialFeatures,
    cloneDeep) {
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

    function getInlineMerchRules() {
        var newRules = cloneDeep(getRules());
        newRules.minAbove = 300;
        newRules.selectors[' > h2'].minAbove = 20;
        return newRules;
    }

    function getLongArticleRules() {
        var newRules = cloneDeep(getRules());

        newRules.selectors[' .ad-slot'] = {
            minAbove: 1300,
            minBelow: 1300
        };

        return newRules;
    }

    // Add new ads while there is still space
    function getAdSpace() {
        return spacefinder.getParaWithSpace(getLongArticleRules()).then(function (nextSpace) {
            // check if spacefinder found another space
            if (typeof nextSpace === 'undefined' || ads.length >= 9) {
                return Promise.resolve(null);
            }

            // if yes add another ad and try another run
            adNames.push(['inline' + (ads.length + 1), 'inline']);
            return insertAdAtP(nextSpace).then(function () {
                return getAdSpace();
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
                    idleFastdom.write(function () {
                        $ad.insertBefore(para);
                        resolve(null);
                    });
                });
            } else {
                return Promise.resolve(null);
            }
        },
        init = function () {
            var rules, inlineMercPromise;

            if (!commercialFeatures.articleBodyAdverts) {
                return false;
            }

            rules = getRules();

            if (config.page.hasInlineMerchandise) {
                inlineMercPromise = spacefinder.getParaWithSpace(getInlineMerchRules()).then(function (space) {
                    if (space) {
                        adNames.unshift(['im', 'im']);
                    }
                    return insertAdAtP(space);
                });
            } else {
                inlineMercPromise = Promise.resolve(null);
            }

            if (config.switches.viewability && detect.getBreakpoint() !== 'mobile') {
                return inlineMercPromise.then(function () {
                    return spacefinder.getParaWithSpace(rules).then(function (space) {
                        return insertAdAtP(space);
                    }).then(function () {
                        return spacefinder.getParaWithSpace(rules).then(function (nextSpace) {
                            return insertAdAtP(nextSpace);
                        }).then(function () {
                            return getAdSpace();
                        });
                    });
                });
            } else {
                return inlineMercPromise.then(function () {
                    return spacefinder.getParaWithSpace(rules).then(function (space) {
                        return insertAdAtP(space);
                    }).then(function () {
                        if (detect.isBreakpoint({max: 'tablet'})) {
                            return spacefinder.getParaWithSpace(rules).then(function (nextSpace) {
                                return insertAdAtP(nextSpace);
                            });
                        } else {
                            return Promise.resolve(null);
                        }
                    });
                });
            }
        };

    return {
        init: init,
        // rules exposed for spacefinder debugging
        getRules: getRules,
        getLenientRules: getInlineMerchRules,

        reset: function () {
            ads = [];
        }
    };
});
