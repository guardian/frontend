define([
    'lodash/objects/merge',
    'common/modules/commercial/creatives/commercial-component'
], function (
    merge,
    CommercialComponent
) {

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028727
     */
    var InlineBook = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
    };

    InlineBook.prototype.create = function () {
        this.component = new CommercialComponent(this.$adSlot, merge(this.params, { type: 'book' })).create();
    };

    return InlineBook;

});
