define([
    'common/$',
    'common/common',
    'common/modules/component',
    'bonzo',
    'bean',
    'lodash/objects/assign',
    'common/utils/detect',
    'common/modules/onward/slot-controller'
], function (
    $,
    common,
    Component,
    bonzo,
    bean,
    extend,
    detect,
    SlotController
) {

    function ArticleBodyAdverts(config) {
        this.context = document;
        this.config = extend(this.config, config);
    }

    Component.define(ArticleBodyAdverts);

    ArticleBodyAdverts.prototype.inlineSlots = [];

    ArticleBodyAdverts.prototype.config = {
        inlineAdTemplate: '<div class="ad-slot--dfp ad-slot--inline" data-name="%dfp_slot%" data-mobile="300,50" data-mobilelandscape="300,50|320,50" data-tabletportrait="300,250"><div id="dfp-ad--%dfp_slot%" class="ad-slot__container"></div></div>'
    };

    ArticleBodyAdverts.prototype.generateInlineAdSlot = function(dfpName) {
        var template = this.config.inlineAdTemplate;

        return bonzo(bonzo.create(template.replace(/%dfp_slot%/g, dfpName)));
    };

    ArticleBodyAdverts.prototype.getNewSlot = function(type) {
        var slot = SlotController.getSlot(type);

        this.inlineSlots.push(slot);

        return bonzo(slot);
    };

    ArticleBodyAdverts.prototype.destroy = function() {
        this.inlineSlots.forEach(function(slot) {
            SlotController.releaseSlot(slot);
        });

        this.inlineSlots = [];
    };

    ArticleBodyAdverts.prototype.init = function() {
        var breakpoint  = detect.getBreakpoint();

        if((/wide|desktop/).test(breakpoint)) {
            this.getNewSlot('adRight').html(this.generateInlineAdSlot('inline1'));
        }

        if((/tablet/).test(breakpoint)) {
            this.getNewSlot('adRight').html(this.generateInlineAdSlot('inline1'));
            // display second inline ad if there's no right hand ad (we show right hand column at >= 900px)
            if(window.innerWidth < 900) {
                this.getNewSlot('adRight').html(this.generateInlineAdSlot('inline2'));
            }
        }

        if((/mobile/).test(breakpoint)) {
            this.getNewSlot('adBlock').html(this.generateInlineAdSlot('inline1'));
            this.getNewSlot('adBlock').html(this.generateInlineAdSlot('inline2'));
        }
    };

    return ArticleBodyAdverts;

});
