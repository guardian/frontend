define([
    'Promise',
    'qwery',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'common/modules/article/space-filler',
    'common/modules/commercial/ad-sizes',
    'common/modules/commercial/dfp/add-slot',
    'common/modules/commercial/dfp/track-ad-render',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/commercial-features',
    'commercial/modules/dfp/performance-logging'
], function (
    Promise,
    qwery,
    config,
    detect,
    fastdom,
    spaceFiller,
    adSizes,
    addSlot,
    trackAdRender,
    createSlot,
    commercialFeatures,
    performanceLogging
) {

    /* bodyAds is a counter that keeps track of the number of inline MPUs
     * inserted dynamically. */
    var bodyAds;
    var replaceTopSlot;
    var getSlotName;

    function init(moduleName) {
        if (!commercialFeatures.articleBodyAdverts) {
            return Promise.resolve(false);
        }

        performanceLogging.moduleStart(moduleName);

        bodyAds = 0;
        replaceTopSlot = detect.isBreakpoint({max : 'phablet'});
        getSlotName = replaceTopSlot ? getSlotNameForMobile : getSlotNameForDesktop;

        if (config.page.hasInlineMerchandise) {
            var im = addInlineMerchAd();
            // Whether an inline merch has been inserted or not,
            // we still want to try to insert inline MPUs. But
            // we must wait for DFP to return, since if the merch
            // component is empty, it might completely change the
            // positions where we insert those MPUs.
            im.then(waitForMerch).then(addInlineAds).then(moduleEnd);
            return im;
        }

        addInlineAds().then(moduleEnd);
        return Promise.resolve(true);

        function moduleEnd() {
            performanceLogging.moduleEnd(moduleName);
        }
    }

    return {
        init: init,

        '@@tests': {
            waitForMerch: waitForMerch,
            addInlineMerchAd: addInlineMerchAd,
            addInlineAds: addInlineAds
        }
    };

    function getSlotNameForMobile() {
        bodyAds += 1;
        return bodyAds === 1 ? 'top-above-nav' : 'inline' + (bodyAds - 1);
    }

    function getSlotNameForDesktop() {
        bodyAds += 1;
        return 'inline' + bodyAds;
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
                if (!prevSlot || Math.abs(slot.top - prevSlot.top) - adSizes.mpu.height >= this.selectors[' .ad-slot'].minBelow) {
                    prevSlot = slot;
                    return true;
                }
                return false;
            }
        };
    }

    function getInlineMerchRules() {
        var inlineMerchRules = getRules();
        inlineMerchRules.minAbove = 300;
        inlineMerchRules.selectors[' > h2'].minAbove = 100;
        inlineMerchRules.selectors[' > :not(p):not(h2):not(.ad-slot)'].minAbove = 200;
        return inlineMerchRules;
    }

    function getLongArticleRules() {
        var longArticleRules = getRules();
        longArticleRules.selectors[' .ad-slot'].minAbove =
        longArticleRules.selectors[' .ad-slot'].minBelow = detect.getViewport().height;
        return longArticleRules;
    }

    function addInlineMerchAd() {
        return spaceFiller.fillSpace(getInlineMerchRules(), function (paras) {
            return insertAdAtPara(paras[0], 'im', 'im').then(function () { return 1; });
        }, {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true
        });
    }

    function addInlineAds() {
        return addArticleAds(2, getRules())
        .then(function (countAdded) {
            if (countAdded === 2) {
                return addArticleAds(8, getLongArticleRules())
                .then(function (countAdded) {
                    return 2 + countAdded;
                });
            } else {
                return countAdded;
            }
        })
        .then(addSlots);
    }

    function waitForMerch(countAdded) {
        return countAdded === 1 ? trackAdRender('dfp-ad--im') : Promise.resolve();
    }

    // Add new ads while there is still space
    function addArticleAds(count, rules) {
        return spaceFiller.fillSpace(rules, insertInlineAds, {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true
        });

        function insertInlineAds(paras) {
            var slots = paras
            .slice(0, Math.min(paras.length, count))
            .map(function (para) {
                return insertAdAtPara(para, getSlotName(), 'inline');
            });

            return Promise.all(slots)
            .then(function () {
                return slots.length;
            });
        }
    }

    function insertAdAtPara(para, name, type) {
        var ad = createSlot(name, type);

        return fastdom.write(function () {
            para.parentNode.insertBefore(ad, para);
        });
    }

    function addSlots(totalCount) {
        qwery('.ad-slot--inline').forEach(addSlot);
        return totalCount;
    }
});
