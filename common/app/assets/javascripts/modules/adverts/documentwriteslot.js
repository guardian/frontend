define([
    'common/utils/mediator',
    'bonzo',
    'postscribe',
    'bean'
], function (
    mediator,
    bonzo,
    postscribe,
    bean
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
            bean.fire(slot, "ad-load");
         } catch(e) {
             //Hide slot to prevent layout bugs
             var node = (this.name === 'Top2') ? this.el.parentNode.parentNode : this.el.parentNode;
             bonzo(node).addClass('u-h');
             mediator.emit('module:error', e, 'common/modules/adverts/documentwriteslot.js', 27);
        }
    };

    return DocWriteAdSlot;
});
