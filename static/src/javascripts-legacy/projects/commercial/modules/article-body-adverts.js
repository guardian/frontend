define([
    'Promise',
    'qwery',
    'lib/config',
    'lib/detect',
    'lib/fastdom-promise',
    'common/modules/experiments/utils',
    'common/modules/article/space-filler',
    'commercial/modules/ad-sizes',
    'commercial/modules/dfp/add-slot',
    'commercial/modules/dfp/track-ad-render',
    'commercial/modules/dfp/create-slot',
    'commercial/modules/commercial-features'
], function (
    Promise,
    qwery,
    config,
    detect,
    fastdom,
    abUtils,
    spaceFiller,
    adSizes,
    addSlot,
    trackAdRender,
    createSlot,
    commercialFeatures
) {

    /* bodyAds is a counter that keeps track of the number of inline MPUs
     * inserted dynamically. */
    var bodyAds;
    var replaceTopSlot;
    var getSlotName;
    var getSlotType;
    var isOffsetingAds = abUtils.testCanBeRun('IncreaseInlineAds') &&
        abUtils.getTestVariantId('IncreaseInlineAds') === 'yes';

    function init(start, stop) {
        start();

        if (!commercialFeatures.articleBodyAdverts) {
            stop();
            return Promise.resolve(false);
        }

        bodyAds = 0;
        replaceTopSlot = detect.isBreakpoint({max : 'phablet'});
        getSlotName = replaceTopSlot ? getSlotNameForMobile : getSlotNameForDesktop;
        getSlotType = replaceTopSlot ? getSlotTypeForMobile : getSlotTypeForDesktop;

        if (config.page.hasInlineMerchandise) {
            var im = addInlineMerchAd();
            // Whether an inline merch has been inserted or not,
            // we still want to try to insert inline MPUs. But
            // we must wait for DFP to return, since if the merch
            // component is empty, it might completely change the
            // positions where we insert those MPUs.
            im.then(waitForMerch).then(addInlineAds).then(stop);
            return im;
        }

        addInlineAds().then(stop);
        return Promise.resolve(true);
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
        return bodyAds === 1 ? 'top-above-nav' : 'inline' + (bodyAds - 1);
    }

    function getSlotNameForDesktop() {
        return 'inline' + bodyAds;
    }

    function getSlotTypeForMobile() {
        return bodyAds === 1 ? 'top-above-nav' : 'inline';
    }

    function getSlotTypeForDesktop() {
        return 'inline';
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

    function getAltRules() {
        var altRules = getRules();
        altRules.selectors = {
            ' .ad-slot': { minAbove: 500, minBelow: 500 }
        };
        return altRules;
    }

    function getInlineMerchRules() {
        var inlineMerchRules = getRules();
        inlineMerchRules.minAbove = 300;
        inlineMerchRules.selectors[' > h2'].minAbove = 100;
        inlineMerchRules.selectors[' > :not(p):not(h2):not(.ad-slot)'].minAbove = 200;
        return inlineMerchRules;
    }

    function getLongArticleRules() {
        var longArticleRules = isOffsetingAds ? getAltRules() : getRules();
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
        return addArticleAds(2, isOffsetingAds ? getAltRules() : getRules())
        .then(function (countAdded) {
            if (countAdded === 2) {
                return addArticleAds(8, getLongArticleRules())
                .then(function (countAdded) {
                    return 2 + countAdded;
                });
            } else {
                return countAdded;
            }
        });
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
                bodyAds += 1;
                return insertAdAtPara(
                    para,
                    getSlotName(),
                    getSlotType(),
                    'inline' + (isOffsetingAds && bodyAds > 1 ? ' offset-right' : ''),
                    isOffsetingAds && bodyAds > 1 ? { desktop: [adSizes.halfPage] } : null
                );
            });

            return Promise.all(slots)
            .then(function () {
                return slots.length;
            });
        }
    }

    function insertAdAtPara(para, name, type, classes, sizes) {
        var ad = createSlot(type, { name: name, classes: classes, sizes: sizes });

        return fastdom.write(function () {
            para.parentNode.insertBefore(ad, para);
        })
        .then(function () {
            addSlot(ad, name === 'im');
        });
    }
});
