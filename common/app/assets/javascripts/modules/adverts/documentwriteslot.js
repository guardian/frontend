/*global OAS_RICH:true */
define([
    'common/utils/mediator',
    'bonzo',
    'postscribe'
], function (
    mediator,
    bonzo,
    postscribe
) {

    var DocWriteAdSlot = function(name, el) {
        this.name = name;
        this.el = el;
        this.loaded = false;
    };

    DocWriteAdSlot.prototype.setDimensions = function(dimensions) {
        this.dimensions = dimensions;
    };

    DocWriteAdSlot.prototype.render = function () {
         try {
            var slot = this.el;
            postscribe(slot, '<script>OAS_RICH("'+this.name+'")</script>');
            this.loaded = true;
            slot.dispatchEvent(new CustomEvent("ad-load"));
         } catch(e) {
             //Hide slot to prevent layout bugs
             var node = (this.name === 'Top2') ? this.el.parentNode.parentNode : this.el.parentNode;
             bonzo(node).addClass('u-h');
             mediator.emit('module:error', e, 'common/modules/adverts/documentwriteslot.js', 27);
        }
    };

    return DocWriteAdSlot;
});
