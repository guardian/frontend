define([
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/article/space-filler',
    'common/modules/commercial/track-ad',
    'common/modules/commercial/dfp/dfp-api',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features'
], function (
    Promise,
    $,
    config,
    detect,
    mediator,
    spaceFiller,
    trackAd,
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

    function init() {
        if (!commercialFeatures.articleBodyAdverts) {
            return false;
        }

        var rules = getRules();

        boot();

        if (config.page.hasInlineMerchandise) {
            addInlineMerchAd(getInlineMerchRules());
        }

        return config.switches.viewability ?
            addArticleAds(2, rules)
            .then(function (countAdded) {
                return Promise.all([
                    countAdded,
                    /* This flag is to check if we allow a second pass: If the page has an inline
                       merch component and because of it no inline slot could be added, we'll wait
                       for it to load and the re-try */
                    !(config.page.hasInlineMerchandise && countAdded === 0) || trackAd.track('dfp-ad--im')
                ]);
            })
            .then(function (args) {
                var countAdded = args[0];
                var isLoaded = args[1];
                // isLoaded can only be false if we fall in the second-pass case
                return !isLoaded ? addArticleAds(2, rules) : countAdded;
            })
            .then(function (countAdded) {
                return Promise.all([
                    countAdded,
                    countAdded === 2 ? addArticleAds(8, getLongArticleRules()) : 0
                ]);
            })
            .then(function (finalCountAdded) {
                /* We can safely add slots, even if they were previously added.
                   dfp-api handles everything for us */
                $('.ad-slot--inline').each(dfp.addSlot);
                return finalCountAdded[0] + finalCountAdded[1];
            }) :
            addArticleAds(2, rules);
    }

    return {
        init: init
    };
});
