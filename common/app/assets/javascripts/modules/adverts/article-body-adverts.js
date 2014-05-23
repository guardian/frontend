define([
    'common/$',
    'common/common',
    'common/modules/component',
    'bonzo',
    'bean',
    'lodash/objects/assign',
    'common/utils/detect',
    'common/modules/onward/slot-controller',
    'common/modules/adverts/dfp'
], function (
    $,
    common,
    Component,
    bonzo,
    bean,
    extend,
    detect,
    SlotController,
    dfp
) {

    function ArticleBodyAdverts(config) {
        this.context = document;
        this.config = extend(this.config, config);
    }

    Component.define(ArticleBodyAdverts);

    ArticleBodyAdverts.prototype.inlineSlots = [];

    ArticleBodyAdverts.prototype.config = {};

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
            this.getNewSlot('adRight').html(dfp.createAdSlot('inline1', 'inline'));
        }

        if((/tablet/).test(breakpoint)) {
            this.getNewSlot('adRight').html(dfp.createAdSlot('inline1', 'inline'));
            // display second inline ad if there's no right hand ad (we show right hand column at >= 900px)
            if(window.innerWidth < 900) {
                this.getNewSlot('adRight').html(dfp.createAdSlot('inline2', 'inline'));
            }
        }

        if((/mobile/).test(breakpoint)) {
            this.getNewSlot('adBlock').html(dfp.createAdSlot('inline1', 'inline'));
            this.getNewSlot('adBlock').html(dfp.createAdSlot('inline2', 'inline'));
        }
    };

    return ArticleBodyAdverts;

});
