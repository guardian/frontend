define([
    'Promise',
    'qwery',
    'commercial/modules/sticky-mpu',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'common/modules/article/space-filler',
    'common/modules/commercial/ad-sizes',
    'common/modules/commercial/dfp/add-slot',
    'common/modules/commercial/dfp/track-ad-render',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/commercial-features',
    'common/modules/onward/geo-most-popular',
    'lodash/functions/memoize'
], function (
    Promise,
    qwery,
    stickyMpu,
    config,
    detect,
    fastdom,
    spaceFiller,
    adSizes,
    addSlot,
    trackAdRender,
    createSlot,
    commercialFeatures,
    mostPopular,
    memoize
) {
    /* We keep a handle on the main column to compute offsets afterwards */
    var mainColumn = qwery('.js-content-main-column')[0];

    /* We keep track of inline MPUs so that we can offset them to the right later */
    var inlineSlots = [];

    /* The promise resolves either when an inline merch slot has been added and
       a DFP call has returned, or directly if no inline slot has been added */
    var waitForMerch = memoize(function (imSlot) {
        return imSlot ? trackAdRender('dfp-ad--im') : Promise.resolve(true);
    });

    /* bodyAds is a counter that keeps track of the number of inline MPUs
     * inserted dynamically. */
    var bodyAds;

    var isWide;
    var isMobile;
    var replaceTopSlot;
    var getSlotName;

    return {
        init: init,

        '@@tests': {
            waitForMerch: waitForMerch
        }
    };

    function init() {
        if (!commercialFeatures.articleBodyAdverts) {
            return Promise.resolve(false);
        }

        boot();

        if (config.page.hasInlineMerchandise) {
            var im = addInlineMerchAd();
            im.then(waitForMerch).then(addInlineAds);
            return im;
        }

        addInlineAds();

        return Promise.resolve(true);
    }

    function boot() {
        bodyAds = 0;
        isWide = detect.getBreakpoint() === 'wide';
        replaceTopSlot = isMobile = !isWide && detect.isBreakpoint({ max: 'phablet' });
        getSlotName = replaceTopSlot ? getSlotNameForMobile : getSlotNameForDesktop;
    }

    function getSlotNameForMobile() {
        bodyAds += 1;
        return bodyAds === 1 ? 'top-above-nav' : 'inline' + (bodyAds - 1);
    }

    function getSlotNameForDesktop() {
        bodyAds += 1;
        return 'inline' + bodyAds;
    }

    function getRules(isMerch) {
        var prevSlot;
        var rules = {
            bodySelector: '.js-article__body',
            slotSelector: ' > p',
            minAbove: isMobile ? 300 : config.page.hasShowcaseMainElement ? 900 : 700,
            minBelow: adSizes.mpu.height,
            selectors: {
                ' > h2': {minAbove: isMobile ? 100 : 0, minBelow: 250},
                ' .ad-slot': {minAbove: 500, minBelow: 500},
                ' > :not(p):not(h2):not(.ad-slot)': {minAbove: 35, minBelow: 400}
            },
            filter: function(slot) {
                if (!prevSlot || Math.abs(slot.top - prevSlot.top) - adSizes.mpu.height >= rules.selectors[' .ad-slot'].minBelow) {
                    prevSlot = slot;
                    return true;
                }
                return false;
            }
        };

        if (!isMerch && isWide) {
            rules.minBelow = 100;
            rules.selectors = {
                ' .ad-slot': { minAbove: 500, minBelow: 500 }
            };
        }

        return rules;
    }

    function getInlineMerchRules() {
        var inlineMerchRules = getRules(true);
        inlineMerchRules.minAbove = 300;
        inlineMerchRules.selectors[' > h2'].minAbove = 100;
        inlineMerchRules.selectors[' > :not(p):not(h2):not(.ad-slot)'].minAbove = 200;
        return inlineMerchRules;
    }

    function getLongArticleRules() {
        var longArticleRules = getRules();
        longArticleRules.selectors[' .ad-slot'].minAbove =
        longArticleRules.selectors[' .ad-slot'].minBelow = Math.max(500, detect.getViewport().height);
        return longArticleRules;
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

            if (isWide) {
                inlineSlots.push.apply(inlineSlots, slots);
            }
        }
    }

    function insertAdAtPara(para, name, type) {
        var ad = createSlot(name, type);
        para.parentNode.insertBefore(ad, para);
        return ad;
    }

    function addSlots() {
        qwery('.js-ad-slot', mainColumn).forEach(addSlot);
    }

    function addInlineMerchAd() {
        return spaceFiller.fillSpace(getInlineMerchRules(), function (paras) {
            return insertAdAtPara(paras[0], 'im', 'im');
        }, {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true
        });
    }

    function addInlineAds() {
        return addArticleAds(2, getRules())
        .then(function () {
            if (inlineSlots.length === 2) {
                return addArticleAds(8, getLongArticleRules());
            }
        })
        .then(function () {
            if (isWide && inlineSlots.length) {
                offsetAds()
                .then(function () {
                    // Prevent memory leak
                    inlineSlots = null;
                });
            }
            addSlots();
        });
    }

    function offsetAds() {
        /* We want the height of the right-hand column, so we must wait for
           everything in it to be rendered */
        return Promise.all([
            stickyMpu.whenRendered,
            mostPopular.whenRendered
        ])
        .then(function () {
            return fastdom.read(function () {
                return qwery('.js-secondary-column > *')
                .reduce(function (height, node) {
                    return height + node.offsetHeight;
                }, 0);
            });
        })
        /* Next, we want to offset to the right all the inline slots *below*
           the components in the right-hand column */
        .then(function (rhHeight) {
            return fastdom.read(function () {
                var mainColumnOffset = mainColumn.getBoundingClientRect().top;
                var slotIndex = 0;
                while (slotIndex < inlineSlots.length) {
                    var slotOffset = inlineSlots[slotIndex].getBoundingClientRect().top - mainColumnOffset;
                    if (rhHeight < slotOffset) {
                        break;
                    }
                    slotIndex += 1;
                }
                return slotIndex;
            });
        })
        .then(function (slotIndex) {
            return fastdom.write(function () {
                inlineSlots.slice(slotIndex).forEach(function (slot) {
                    slot.classList.add('ad-slot--offset-right');
                });
            });
        });
    }
});
