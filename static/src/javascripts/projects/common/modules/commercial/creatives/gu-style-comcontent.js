define([
    'fastdom',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/views/svgs',
    'common/modules/commercial/gustyle/gustyle',
    'text!common/views/commercial/creatives/gu-style-comcontent.html',
    'text!common/views/commercial/creatives/gu-style-hosted.html',
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
    gustyleHostedTpl,
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
                articleContentColor: 'gu-display__content-color--' + this.params.articleContentColor,
                articleContentPosition: 'gu-display__content-position--' + this.params.articleContentPosition,
                articleHeaderFontSize: 'gu-display__content-size--' + this.params.articleHeaderFontSize,
                articleTextFontSize: 'gu-display__content-size--' + this.params.articleTextFontSize,
                brandLogoPosition: 'gu-display__logo-pos--' + this.params.brandLogoPosition,
                externalLinkIcon: externalLinkIcon,
                isHostedBottom: this.params.adType === 'gu-style-hosted-bottom'
            };
        var templateToLoad = this.params.adType === 'gu-style' ? gustyleComcontentTpl : gustyleHostedTpl;

        $.create(template(templateToLoad, { data: merge(this.params, templateOptions) })).appendTo(this.$adSlot);
        new GuStyle(this.$adSlot, this.params).addLabel();

        if (this.params.trackingPixel) {
            addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
        }

    };

    return GustyleComcontent;

});
