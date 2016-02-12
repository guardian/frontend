define([
    'fastdom',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/views/svgs',
    'common/modules/commercial/gustyle/gustyle',
    'text!common/views/commercial/creatives/gu-style-comcontent.html',
    'lodash/objects/merge',
    'common/modules/commercial/creatives/add-tracking-pixel'
], function (
    fastdom,
    $,
    detect,
    mediator,
    template,
    svgs,
    GuStyle,
    gustyleComcontentTpl,
    merge,
    addTrackingPixel
) {

    var GustyleComcontent = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
    };

    GustyleComcontent.prototype.create = function () {
        var externalLinkIcon = svgs('externalLink', ['gu-external-icon']),
            templateOptions = {
                clickMacro: this.params.clickMacro,
                externalLinkIcon: externalLinkIcon
            };

        $.create(template(gustyleComcontentTpl, { data: merge(this.params, templateOptions) })).appendTo(this.$adSlot);
        new GuStyle(this.$adSlot, this.params).addLabel();

        if (this.params.trackingPixel) {
            addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
        }

    };

    return GustyleComcontent;

});
