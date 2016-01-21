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

    /* bodyAds is a counter that keeps track of the number of inline MPUs
     * inserted dynamically. It is used to give each MPU its own ID. */
    var bodyAds;
    var inlineMerchRules;
    var longArticleRules;

    function boot() {
        bodyAds = 0;
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
            insertAdAtPara(paras[0], 'im', 'im');
        });
    }

    // Add new ads while there is still space
    function addArticleAds(count, rules) {
        return addArticleAdsRec(count, 0);

        /*
         * count:Integer is the number of adverts that should optimally inserted
         * countAdded:Integer is the number of adverts effectively added. It is
         * an accumulator (although no JS engine optimizes tail calls so far).
         */
        function addArticleAdsRec(count, countAdded) {
            return count === 0 ?
                Promise.resolve(countAdded) :
                tryAddingAdvert(rules).then(onArticleAdAdded);

            function onArticleAdAdded(trySuccessful) {
                // If last attempt worked, recurse another
                return trySuccessful ?
                    addArticleAdsRec(count - 1, countAdded + 1) :
                    countAdded;
            }
        }
    }

    function tryAddingAdvert(rules) {
        return spaceFiller.fillSpace(rules, insertInlineAd);

        function insertInlineAd(paras) {
            bodyAds += 1;
            insertAdAtPara(paras[0], 'inline' + bodyAds, 'inline');
        }
    }

    function insertAdAtPara(para, name, type) {
        var $ad = $.create(createAdSlot(name, type));
        $ad.insertBefore(para);
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
            }).then(function () {
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

        if (config.page.hasInlineMerchandise) {
            addInlineMerchAd(getInlineMerchRules());
        }

        if (config.switches.viewability && detect.getBreakpoint() !== 'mobile') {
            return addArticleAds(2, rules).then(function (countAdded) {
                if (countAdded === 0) {
                    mediator.on('modules:commercial:dfp:rendered', onAdRendered);
                }

                return countAdded === 2 ?
                    addArticleAds(8, getLongArticleRules()) :
                    countAdded;
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
