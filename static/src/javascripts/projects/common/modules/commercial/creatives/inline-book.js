define([
    'lodash/objects/merge',
    'common/utils/config',
    'common/modules/commercial/creatives/commercial-component'
], function (
    merge,
    config,
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
        if (config.page.isbn || this.params.isbn) {
            this.component = new CommercialComponent(this.$adSlot, merge(this.params, { type: 'book' })).create();
        }
    };

    return InlineBook;

});
