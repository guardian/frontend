define([
    'common/modules/component',
    'bonzo',
    'lodash/objects/assign',
    'common/utils/detect',
    'common/modules/adverts/dfp',
    'common/modules/article/spacefinder',
    'common/utils/deferToLoad'
], function (
    Component,
    bonzo,
    extend,
    detect,
    dfp,
    spacefinder,
    deferToLoad
) {

    function ArticleBodyAdverts(config) {
        this.context = document;
        this.config = extend(this.config, config);
    }

    Component.define(ArticleBodyAdverts);

    ArticleBodyAdverts.prototype.ads = [];

    ArticleBodyAdverts.prototype.config = {};

    ArticleBodyAdverts.prototype.destroy = function() {
        this.ads.forEach(function(ad) {
            bonzo(ad).remove();
        });
    };

    ArticleBodyAdverts.prototype.generateAdElement = function() {
        var adEl = bonzo.create(dfp.createAdSlot('inline' + (this.ads.length+1), 'inline'));
        this.ads.push(adEl);
        return adEl;
    };

    ArticleBodyAdverts.prototype.insertAdAtP = function(para) {
        if (para) {
            bonzo(this.generateAdElement()).insertBefore(para);
        }
    };

    ArticleBodyAdverts.prototype.insertAd = function() {
        this.insertAdAtP(spacefinder.getParaWithSpace(300, 350, 75));
    };

    ArticleBodyAdverts.prototype.init = function() {
        var boundInit = function(){
            var breakpoint  = detect.getBreakpoint();

            if((/wide|desktop/).test(breakpoint)) {
                this.insertAd();
            }
            else if((/tablet/).test(breakpoint)) {
                this.insertAd();
                if(window.innerWidth < 900) {
                    this.insertAd();
                }
            }
            else if((/mobile/).test(breakpoint)) {
                this.insertAd();
                this.insertAd();
            }
        };
        deferToLoad(boundInit.bind(this));
    };

    return ArticleBodyAdverts;
});
