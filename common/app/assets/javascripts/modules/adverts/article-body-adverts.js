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

    ArticleBodyAdverts.prototype.inlineSlots = [];

    ArticleBodyAdverts.prototype.config = {
        inlineAdTemplate: '<div class="ad-slot ad-slot--inline" data-base="%slot%" data-median="%slot%"><div class="ad-slot__label">Advertisement</div><div class="ad-container"></div></div>'
    };

    ArticleBodyAdverts.prototype.generateInlineAdSlot = function(id) {
        var template = this.config.inlineAdTemplate;

        return bonzo(bonzo.create(template.replace(/%slot%/g, id)));
    };

    ArticleBodyAdverts.prototype.getNewSlot = function(type) {
        var slot = SlotController.getSlot(type);

        this.inlineSlots.push(slot);

        return slot;
    };

    ArticleBodyAdverts.prototype.destroy = function() {
        this.inlineSlots.forEach(function(slot) {
            SlotController.releaseSlot(slot);
        });

        this.inlineSlots = [];
    };

    ArticleBodyAdverts.prototype.reload = function() {
        this.destroy();
        this.init();
    };

    ArticleBodyAdverts.prototype.init = function() {
        var breakpoint  = detect.getBreakpoint();

        if((/wide|desktop/).test(breakpoint)) {
            bonzo(this.getNewSlot('adRight')).html(this.generateInlineAdSlot('Middle1'));
        }

        if((/tablet/).test(breakpoint)) {
            bonzo(this.getNewSlot('adRight')).html(this.generateInlineAdSlot('Middle'));
            bonzo(this.getNewSlot('adRight')).html(this.generateInlineAdSlot('Middle1'));
        }

        if((/mobile/).test(breakpoint)) {
            bonzo(this.getNewSlot('adBlock')).html(this.generateInlineAdSlot('x49'));
            bonzo(this.getNewSlot('adBlock')).html(this.generateInlineAdSlot('Bottom2'));
        }
    };

    return ArticleBodyAdverts;

});
