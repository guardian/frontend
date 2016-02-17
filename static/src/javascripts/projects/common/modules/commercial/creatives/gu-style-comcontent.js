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
        this.contentPosition = {
            bottom: 'bottom: 30px;',
            top: 'top: 30px;'
        };
        this.fontSize = {
            small: 'font-size: 0.9rem; line-height: 0.9rem;',
            regular: 'font-size: 1.25rem;',
            big: 'font-size: 1.35rem;'
        };
    };

    GustyleComcontent.prototype.create = function () {
        var externalLinkIcon = svgs('externalLink', ['gu-external-icon']),
            templateOptions = {
                articleContentColor: this.params.articleContentColor === 'white' ? 'color: #ffffff;' : 'color: #000000;',
                articleContentPosition: this.contentPosition[this.params.articleContentPosition],
                articleHeaderFontSize: this.fontSize[this.params.articleHeaderFontSize],
                articleTextFontSize: this.fontSize[this.params.articleTextFontSize],
                brandLogoPosition: this.params.brandLogoPosition === 'bottom-right' ? 'right: 10px; bottom: 10px; left: auto;' : 'left: 10px; top: 0; right: auto;',
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
