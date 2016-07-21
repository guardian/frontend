define([
    'Promise',
    'qwery',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/article/space-filler',
    'common/modules/commercial/dfp/add-slot',
    'common/modules/commercial/dfp/track-ad-render',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/commercial-features',
    'lodash/functions/memoize'
], function (
    Promise,
    qwery,
    config,
    detect,
    spaceFiller,
    addSlot,
    trackAdRender,
    createSlot,
    commercialFeatures,
    memoize
) {

    /* bodyAds is a counter that keeps track of the number of inline MPUs
     * inserted dynamically. */
    var bodyAds;
    var inlineAd;
    var replaceTopSlot;
    var inlineMerchRules;
    var longArticleRules;

    function boot() {
        bodyAds = 0;
        inlineAd = 0;
        replaceTopSlot = detect.isBreakpoint({max : 'phablet'});
    }

    function getRules() {
        var prevSlot;
        return {
            bodySelector: '.js-article__body',
            slotSelector: ' > p',
            minAbove: detect.isBreakpoint({ max: 'tablet' }) ? 300 : 700,
            minBelow: 300,
            selectors: {
                ' > h2': {minAbove: detect.getBreakpoint() === 'mobile' ? 100 : 0, minBelow: 250},
                ' .ad-slot': {minAbove: 500, minBelow: 500},
                ' > :not(p):not(h2):not(.ad-slot)': {minAbove: 35, minBelow: 400}
            },
            filter: function(slot) {
                if (!prevSlot || Math.abs(slot.top - prevSlot.top) >= this.selectors[' .ad-slot'].minBelow) {
                    prevSlot = slot;
                    return true;
                }
                return false;
            }
        };
    }

    function getInlineMerchRules() {
        if (!inlineMerchRules) {
            inlineMerchRules = getRules();
            inlineMerchRules.minAbove = 300;
            inlineMerchRules.selectors[' > h2'].minAbove = 100;
            inlineMerchRules.selectors[' > :not(p):not(h2):not(.ad-slot)'].minAbove = 200;
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
        }, {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true
        });
    }

    // Add new ads while there is still space
    function addArticleAds(count, rules) {
        return spaceFiller.fillSpace(rules, insertInlineAds, {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true
        });

        function insertInlineAds(paras) {
            var countAdded = 0;
            while(countAdded < count && paras.length) {
                var para = paras.shift();
                var adDefinition;
                if (replaceTopSlot && bodyAds === 0) {
                    adDefinition = 'top-above-nav';
                } else {
                    inlineAd += 1;
                    adDefinition = 'inline' + inlineAd;
                }
                insertAdAtPara(para, adDefinition, 'inline');
                bodyAds += 1;
                countAdded += 1;
            }
            return countAdded;
        }
    }

    function insertAdAtPara(para, name, type) {
        var ad = createSlot(name, type);
        para.parentNode.insertBefore(ad, para);
    }

    function addSlots(countAdded) {
        if (countAdded > 0) {
            qwery('.ad-slot--inline').forEach(addSlot);
        }
    }

    // If a merchandizing component has been rendered but is empty,
    // we allow a second pass for regular inline ads. This is because of
    // the decoupling between the spacefinder algorithm and the targeting
    // in DFP: we can only know if a slot can be removed after we have
    // received a response from DFP
    var waitForMerch = memoize(function () {
        return trackAdRender('dfp-ad--im').then(function (isLoaded) {
            return isLoaded ? 0 : addArticleAds(2, getRules());
        }).then(function (countAdded) {
            return countAdded === 2 ?
                addArticleAds(8, getLongArticleRules()).then(function (countAdded) {
                    return 2 + countAdded;
                }) :
                countAdded;
        });
    });

    var insertLongAds = memoize(function () {
        return addArticleAds(8, getLongArticleRules()).then(function (countAdded) {
            return 2 + countAdded;
        });
    });

    function init() {
        if (!commercialFeatures.articleBodyAdverts) {
            return Promise.resolve(false);
        }

        var rules = getRules();

        boot();

        if (config.page.hasInlineMerchandise) {
            addInlineMerchAd(getInlineMerchRules());
        }

        return addArticleAds(2, rules).then(function (countAdded) {
            if (config.page.hasInlineMerchandise && countAdded === 0) {
                waitForMerch().then(addSlots);
            } else if (countAdded === 2) {
                insertLongAds().then(addSlots);
            }
        });
    }

    return {
        init: init,

        '@@tests': {
            waitForMerch: waitForMerch,
            insertLongAds: insertLongAds
        }
    };
});
