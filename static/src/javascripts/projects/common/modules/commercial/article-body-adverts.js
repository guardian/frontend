define([
    'lodash/objects/cloneDeep',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/article/spacefinder',
    'common/modules/commercial/create-ad-slot'
], function (
    cloneDeep,
    $,
    config,
    detect,
    spacefinder,
    createAdSlot
) {

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

    function getLenientRules() {
        var lenientRules = cloneDeep(getRules());
        // more lenient rules, closer to the top start of the article
        lenientRules.minAbove = 300;
        lenientRules.selectors[' > h2'].minAbove = 20;
        return lenientRules;
    }

    var ads = [],
        adNames = [['inline1', 'inline'], ['inline2', 'inline']],
        insertAdAtP = function (para) {
            if (para) {
                var adName = adNames[ads.length],
                    $ad    = $.create(createAdSlot(adName[0], adName[1]))
                                .insertBefore(para);
                ads.push($ad);
            }
        },
        init = function () {

            var rules, lenientRules;

            // is the switch off, or not an article, or a live blog
            if (
                !config.switches.standardAdverts ||
                    config.page.contentType !== 'Article' ||
                    config.page.isLiveBlog
            ) {
                return false;
            }

            rules = getRules();
            lenientRules = getLenientRules();

            if (config.page.hasInlineMerchandise) {
                adNames.unshift(['im', 'im']);
                insertAdAtP(spacefinder.getParaWithSpace(lenientRules));
            }
            insertAdAtP(spacefinder.getParaWithSpace(rules));

            if (detect.isBreakpoint({ max: 'tablet' })) {
                insertAdAtP(spacefinder.getParaWithSpace(rules));
            }
        };

    return {

        init: init,

        // rules exposed for spacefinder debugging
        getRules: getRules,
        getLenientRules: getLenientRules,

        reset: function () {
            ads = [];
        }

    };
});
