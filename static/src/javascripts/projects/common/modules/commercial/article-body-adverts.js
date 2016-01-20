define([
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/article/space-filler',
    'common/modules/commercial/dfp-api',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features'
], function (
    Promise,
    $,
    config,
    detect,
    mediator,
    spaceFiller,
    dfp,
    createAdSlot,
    commercialFeatures
) {

    var bodyAds;
    var adNames;
    var inlineMerchRules;
    var longArticleRules;

    function boot() {
        bodyAds = 0;
        adNames = [];
    }

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
        if (!longArticleRules) {
            longArticleRules = getRules();
            longArticleRules.selectors[' .ad-slot'].minAbove =
            longArticleRules.selectors[' .ad-slot'].minBelow = 1300;
        }
        return longArticleRules;
    }

    function addInlineMerchAd(rules) {
        spaceFiller.fillSpace(rules, function (paras) {
            adNames.unshift(['im', 'im']);
            insertAdAtPara(paras);
        });
    }

    // Add new ads while there is still space
    function addArticleAds(count, rules) {
        return addArticleAdsRec(count, 0, rules);
    }

    function addArticleAdsRec(count, countAdded, rules) {
        if (count === 0) {
            return Promise.resolve(countAdded);
        }
        return tryAddingAdvert(rules).then(onArticleAdAdded);

        function onArticleAdAdded(trySuccessful) {
            // If last attempt worked, recurse another
            if (trySuccessful) {
                return addArticleAdsRec(count - 1, countAdded + 1, rules);
            } else {
                return countAdded;
            }
        }
    }

    function tryAddingAdvert(rules) {
        return spaceFiller.fillSpace(rules, insertInlineAd);

        function insertInlineAd(paras) {
            adNames.push(['inline' + (bodyAds + 1), 'inline']);
            insertAdAtPara(paras);
        }
    }

    function insertAdAtPara(paras) {
        var adName = adNames[bodyAds],
            $ad    = $.create(createAdSlot(adName[0], adName[1]));

        bodyAds += 1;
        $ad.insertBefore(paras[0]);
    }

    // If a merchandizing component has been rendered but is empty,
    // we allow a second pass for regular inline ads. This is because of
    // the decoupling between the spacefinder algorightm and the targeting
    // in DFP: we can only know if a slot can be removed after we have
    // received a response from DFP
    function onAdRendered(event) {
        if (event.slot.getSlotElementId() === 'dfp-ad--im' && event.isEmpty) {
            mediator.off('modules:commercial:dfp:rendered', onAdRendered);
            addArticleAds(2, getRules()).then(function (countAdded) {
                return countAdded === 2 ?
                    addArticleAds(8, getLongArticleRules()) :
                    countAdded;
            }).then(function() {
                $('.ad-slot--inline').each(dfp.addSlot);
            });
        }
    }

    function init() {
        if (!commercialFeatures.articleBodyAdverts) {
            return false;
        }

        var rules = getRules();

        boot();

        // if (config.page.hasInlineMerchandise) {
            addInlineMerchAd(getInlineMerchRules());
        // }

        if (config.switches.viewability && detect.getBreakpoint() !== 'mobile') {
            return addArticleAds(2, rules).then(function (countAdded) {
                if (countAdded === 0) {
                    mediator.on('modules:commercial:dfp:rendered', onAdRendered);
                } else if (countAdded === 2) {
                    addArticleAds(8, getLongArticleRules());
                }
            });
        } else {
            return tryAddingAdvert(rules).then(function (trySuccessful) {
                if (trySuccessful && detect.isBreakpoint({max: 'tablet'})) {
                    return tryAddingAdvert(rules);
                } else {
                    return null;
                }
            });
        }
    }

    return {
        init: init
    };
});
