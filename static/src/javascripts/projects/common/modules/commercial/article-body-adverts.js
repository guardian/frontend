define([
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/article/space-filler',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features'
], function (
    Promise,
    $,
    config,
    detect,
    spaceFiller,
    createAdSlot,
    commercialFeatures
) {
    function getRules() {
        return {
            bodySelector: '.js-article__body',
            slotSelector: ' > p',
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
        if (!inlineMerchRules) {
            inlineMerchRules = getRules();
            inlineMerchRules.minAbove = 300;
            inlineMerchRules.selectors[' > h2'].minAbove = 20;
        }
        return inlineMerchRules;
    }

    function getLongArticleRules() {
        if (!longArticleAdsRules) {
            longArticleAdsRules = getRules();
            longArticleAdsRules.selectors[' .ad-slot--im'] = longArticleAdsRules.selectors[' .ad-slot'];
            longArticleAdsRules.selectors[' .ad-slot--inline'] = {
                minAbove: 1300,
                minBelow: 1300
            };
            longArticleAdsRules.selectors[' .ad-slot'] = null;
        }
        return longArticleAdsRules;
    }

    // Add new ads while there is still space
    function addLongArticleAds(count) {
        if (count < 1) {
            return Promise.resolve(null);
        } else {
            return tryAddingAdvert().then(function (trySuccessful) {
                // If last attempt worked, recurse another
                if (trySuccessful) {
                    return addLongArticleAds(count - 1);
                } else {
                    return Promise.resolve(null);
                }
            });
        }

        function tryAddingAdvert() {
            return spaceFiller.fillSpace(getLongArticleRules(), function (paras) {
                adNames.push(['inline' + (ads.length + 1), 'inline']);
                insertAdAtPara(paras);
            });
        }
    }

    function insertAdAtPara(paras) {
        var adName = adNames[ads.length],
            $ad    = $.create(createAdSlot(adName[0], adName[1]));

        ads.push($ad);
        $ad.insertBefore(paras[0]);
    }

    var ads = [],
        adNames = [['inline1', 'inline'], ['inline2', 'inline']],
        inlineMerchRules,
        longArticleAdsRules,
        init = function () {
            if (!commercialFeatures.articleBodyAdverts) {
                return false;
            }

            var rules = getRules();

            if (config.page.hasInlineMerchandise) {
                spaceFiller.fillSpace(getInlineMerchRules(), function (paras) {
                    adNames.unshift(['im', 'im']);
                    insertAdAtPara(paras);
                });
            }

            if (config.switches.viewability && detect.getBreakpoint() !== 'mobile') {
                return tryAddingAdvert().then(tryAddingAdvert).then(function () {
                    return addLongArticleAds(8);
                });
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
                return spaceFiller.fillSpace(rules, insertAdAtPara);
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
