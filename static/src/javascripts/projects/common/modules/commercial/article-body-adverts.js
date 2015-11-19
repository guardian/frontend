define([
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/article/space-filler',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features',
    'lodash/objects/cloneDeep'
], function (
    Promise,
    $,
    config,
    detect,
    spaceFiller,
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
    function addLongArticleAds() {
        if (ads.length >= 9) {
            return Promise.resolve(null);
        } else {
            return tryAddingAdvert().then(function (trySuccessful) {
                // If last attempt worked, recurse another
                if (trySuccessful) {
                    return addLongArticleAds();
                } else {
                    return Promise.resolve(null);
                }
            });
        }

        function tryAddingAdvert() {
            return spaceFiller.insertAtFirstSpace(getLongArticleRules(), function (para) {
                adNames.push(['inline' + (ads.length + 1), 'inline']);
                insertAdAtPara(para);
            });
        }
    }

    function insertAdAtPara(para) {
        var adName = adNames[ads.length],
            $ad    = $.create(createAdSlot(adName[0], adName[1]));

        ads.push($ad);
        $ad.insertBefore(para);
    }

    var ads = [],
        adNames = [['inline1', 'inline'], ['inline2', 'inline']],
        init = function () {
            if (!commercialFeatures.articleBodyAdverts) {
                return false;
            }

            var rules = getRules();

            if (config.page.hasInlineMerchandise) {
                spaceFiller.insertAtFirstSpace(getInlineMerchRules(), function (para) {
                    adNames.unshift(['im', 'im']);
                    insertAdAtPara(para);
                });
            }

            if (config.switches.viewability && detect.getBreakpoint() !== 'mobile') {
                return tryAddingAdvert().then(tryAddingAdvert).then(addLongArticleAds);
            } else {
                return tryAddingAdvert().then(function () {
                    if (detect.isBreakpoint({max: 'tablet'})) {
                        return tryAddingAdvert();
                    } else {
                        return Promise.resolve(null);
                    }
                });
            }

            function tryAddingAdvert() {
                return spaceFiller.insertAtFirstSpace(rules, insertAdAtPara);
            }
        };

    return {
        init: init,
        // rules exposed for spacefinder debugging
        getRules: getRules,
        getInlineMerchRules: getInlineMerchRules,

        reset: function () {
            ads = [];
        }
    };
});
