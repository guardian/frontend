/*global guardian */
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

    ArticleBodyAdverts.prototype.config = {
        inlineAdTemplate: '<div class="ad-slot ad-slot--inline" data-base="%slot%" data-median="%slot%"><div class="ad-slot__label">Advertisement</div><div class="ad-container"></div></div>'
    };

    ArticleBodyAdverts.prototype.generateInlineAdSlot = function(id) {
        var template = this.config.inlineAdTemplate;

        return bonzo(bonzo.create(template.replace(/%slot%/g, id)));
    };

    ArticleBodyAdverts.prototype.reload = function() {
        this.init();
    };

    ArticleBodyAdverts.prototype.init = function() {
        var breakpoint  = detect.getBreakpoint();

        // Check if we already have slots assigned
        if(this.inlineSlot1 === undefined) {
            this.inlineSlot1 = SlotController.getSlot('adRight');
        }

        if((/wide|desktop/).test(breakpoint)) {
            bonzo(this.inlineSlot1).html(this.generateInlineAdSlot('Middle1'));

            // Release slot2 if it exists
            if(this.inlineSlot2) {
                SlotController.releaseSlot(this.inlineSlot2);
            }
        }

        if((/tablet/).test(breakpoint)) {
            if(this.inlineSlot2 === undefined) {
                this.inlineSlot2 = SlotController.getSlot('adRight');
            }

            bonzo(this.inlineSlot1).html(this.generateInlineAdSlot('Middle'));
            bonzo(this.inlineSlot2).html(this.generateInlineAdSlot('Middle1'));
        }

        if((/mobile/).test(breakpoint)) {
            if(this.inlineSlot2 === undefined) {
                this.inlineSlot2 = SlotController.getSlot('adRight');
            }

            bonzo(this.inlineSlot1).html(this.generateInlineAdSlot('x49'));
            bonzo(this.inlineSlot2).html(this.generateInlineAdSlot('Bottom2'));
        }
    };

    return ArticleBodyAdverts;

});
