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
        inlineAdTemplate: '<div class="ad-slot ad-slot--inline" data-base="%slot%" data-median="%slot%"><div class="ad-slot__label">Advertisement</div><div class="ad-container"></div></div><div class="ad-slot__dfp ad-slot--inline" data-name="%slot%" data-mobile="300,50" data-tabletportrait="300,250"><div id="inline-ad-slot__%slot%" class="ad-container"></div></div>'
    };

    ArticleBodyAdverts.prototype.generateInlineAdSlot = function(id) {
        var template = this.config.inlineAdTemplate;

        return bonzo(bonzo.create(template.replace(/%slot%/g, id)));
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
            var portrait = window.innerWidth < 810;

            if(portrait) {
                this.getNewSlot('adRight').html(this.generateInlineAdSlot('right'));
                this.getNewSlot('adRight').html(this.generateInlineAdSlot('inline1'));
            } else {
                this.getNewSlot('adRight').html(this.generateInlineAdSlot('inline1'));
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
