define([
    'Promise',
    'qwery',
    'commercial/modules/sticky-mpu',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/steady-page',
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
    steadyPage,
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
    var mainColumn = qwery('.js-content-main-column')[0];
    var inlineSlots = [];

    // If a merchandizing component has been rendered but is empty,
    // we allow a second pass for regular inline ads. This is because of
    // the decoupling between the spacefinder algorithm and the targeting
    // in DFP: we can only know if a slot can be removed after we have
    // received a response from DFP
    var waitForMerch = memoize(function (imSlot) {
        return imSlot ?
            trackAdRender('dfp-ad--im').then(addInlineAds) :
            addInlineAds();
    });

    /* bodyAds is a counter that keeps track of the number of inline MPUs
     * inserted dynamically. */
    var bodyAds;
    var isWide;
    var isMobile;
    var replaceTopSlot;

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
            im.then(waitForMerch);
            return im;
        }

        addInlineAds();

        return Promise.resolve(true);
    }

    function boot() {
        bodyAds = 0;
        inlineAd = 0;
        isWide = detect.getBreakpoint() === 'wide';
        replaceTopSlot = isMobile = !isWide && detect.isBreakpoint({ max: 'tablet' });
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
        longArticleRules.selectors[' .ad-slot'].minBelow = detect.getViewport().height;
        return longArticleRules;
    }

    // Add new ads while there is still space
    function addArticleAds(count, rules) {
        return spaceFiller.fillSpace(rules, insertInlineAds, {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true,
            domWriter: isMobile ? writerOverride : false
        });

        function insertInlineAds(paras) {
            var promises = paras
            .slice(0, Math.min(paras.length, count))
            .map(function (para) {
                var adDefinition;
                if (replaceTopSlot && bodyAds === 0) {
                    adDefinition = 'top-above-nav';
                } else {
                    adDefinition = 'inline' + (replaceTopSlot ? bodyAds : bodyAds + 1);
                }
                bodyAds += 1;
                return insertAdAtPara(para, adDefinition, 'inline');
            });

            return Promise.all(promises)
            .then(function (slots) {
                slots.forEach(function (slot) {
                    inlineSlots.push(slot);
                });
            });
        }
    }

    function insertAdAtPara(para, name, type) {
        var ad = createSlot(name, type);

        // If on mobile we will
        // insert ad using steady page
        // to avoid jumping the user
        if (isMobile) {
            return steadyPage.insert(ad, function() {
                insertion(ad, para);
                return ad;
            });
        } else {
            // If we're not on mobile we insert and resolve the promise immediately
            return new Promise(function (resolve) {
                insertion(ad, para);
                resolve(ad);
            });
        }

        function insertion (ad, para) {
            para.parentNode.insertBefore(ad, para);
        }
    }

    function addSlots() {
        qwery('.js-ad-slot', mainColumn).forEach(addSlot);
    }

    // If we're on mobile, we want to use steady-page right before dom insertion
    // when we have the adslot so we provide a non-fastdom writer as
    // fastdom is handled in steady-page
    function writerOverride (writerCallback) {
        return writerCallback();
    }

    function addInlineMerchAd() {
        return spaceFiller.fillSpace(getInlineMerchRules(), function (paras) {
            return insertAdAtPara(paras[0], 'im', 'im');
        }, {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true,
            domWriter: isMobile ? writerOverride : false
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
                offsetAds();
            }
            addSlots();
        });
    }

    function offsetAds() {
        Promise.all([
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
            fastdom.write(function () {
                inlineSlots.slice(slotIndex).forEach(function (slot) {
                    slot.classList.add('ad-slot--offset-right');
                });
            });
        });
    }
});
