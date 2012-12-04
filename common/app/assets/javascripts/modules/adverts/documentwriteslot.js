/*global OAS_RICH:true */
define([
    'common',
    'domwrite'
], function (
    common,
    domwrite
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
            OAS_RICH(this.name);
            var slot = this.el;
            domwrite.render(slot);
            this.loaded = true;
         } catch(e) {
             common.mediator.emit('module:error', e, 'document-write.js');
        }
    };

    return DocWriteAdSlot;
});