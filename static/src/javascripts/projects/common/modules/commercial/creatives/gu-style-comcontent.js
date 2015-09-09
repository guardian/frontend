define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'text!common/views/commercial/creatives/gu-style-comcontent.html'
], function (
    fastdom,
    $,
    _,
    detect,
    mediator,
    template,
    gustyleComcontentTpl
) {

    var GustyleComcontent = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
    };


    GustyleComcontent.prototype.create = function () {
        var templateOptions = {
            clickMacro: this.params.clickMacro
        };

        $.create(template(gustyleComcontentTpl, { data: _.merge(this.params, templateOptions) })).appendTo(this.$adSlot);

        if (this.params.trackingPixel) {
            this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
        }

    };

    return GustyleComcontent;

});
