define([
    'common/modules/component',
    'common/$',
    'lodash/objects/assign',
    'common/utils/detect',
    'common/modules/adverts/dfp',
    'common/modules/article/spacefinder',
    'common/utils/deferToLoad',
    'common/modules/experiments/ab'
], function (
    Component,
    $,
    extend,
    detect,
    dfp,
    spacefinder,
    deferToLoad,
    ab
) {

    function ArticleBodyAdverts(config) {
        this.context = document;
        this.config = extend(this.config, config);
    }

    Component.define(ArticleBodyAdverts);

    ArticleBodyAdverts.prototype.ads = [];

    ArticleBodyAdverts.prototype.config = {};

    ArticleBodyAdverts.prototype.destroy = function() {
        this.ads.forEach(function($ad) {
            $ad.remove();
        });
    };

    ArticleBodyAdverts.prototype.generateAdElement = function() {
        var adIndex = this.ads.length + 1,
            $ad = $.create(dfp.createAdSlot('inline' + adIndex, 'inline'));
        if (['articles', 'fronts-and-articles'].indexOf(ab.getTestVariant('LargerMobileMpu')) > -1 && adIndex === 1) {
            $ad
                .removeAttr('data-mobilelandscape')
                .removeAttr('data-tabletportrait')
                .data('mobile', '300,250');
        }
        this.ads.push($ad);
        return $ad;
    };

    ArticleBodyAdverts.prototype.insertAdAtP = function(para) {
        if (para) {
            this.generateAdElement().insertBefore(para);
        }
    };

    ArticleBodyAdverts.prototype.init = function() {
        var boundInit = function(){
            var breakpoint  = detect.getBreakpoint();

            var rules = {
                minAbove: 250,
                minBelow: 300,
                selectors: {
                    ' > h2': {minAbove: breakpoint === 'mobile' ? 20 : 0, minBelow: 250},
                    ' > *:not(p):not(h2)': {minAbove: 25, minBelow: 250},
                    ' .ad-slot': {minAbove: 500, minBelow: 500}
                }
            };

            if((/wide|desktop|tablet/).test(breakpoint)) {
                this.insertAdAtP(spacefinder.getParaWithSpace(rules));
                if(window.innerWidth < 900) {
                    this.insertAdAtP(spacefinder.getParaWithSpace(rules));
                }
            } else if(breakpoint === 'mobile') {
                this.insertAdAtP(spacefinder.getParaWithSpace(rules));
                this.insertAdAtP(spacefinder.getParaWithSpace(rules));
            }
        };
        deferToLoad(boundInit.bind(this));
    };

    return ArticleBodyAdverts;
});
