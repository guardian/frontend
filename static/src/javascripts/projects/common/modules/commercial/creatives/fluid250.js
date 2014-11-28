define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250.html'
], function (
    bean,
    bonzo,
    $,
    mediator,
    storage,
    template,
    fluid250Tpl
) {
    var Creative = function ($adSlot, params) {
        this.$adSlot      = $adSlot;
        this.params       = params;
    };

    Creative.prototype.create = function () {
        var $fluid250 = $.create(template(fluid250Tpl, this.params));

        $fluid250.appendTo(this.$adSlot);
        
        this.$adSlot.addClass('ad-slot--top-banner-ad__fluid250');
    };

    return Creative;

});
