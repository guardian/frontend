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
            bottom: 'gu-display__content-position--bottom',
            top: 'gu-display__content-position--top'
        };
        this.fontSize = {
            small: 'gu-display__content-size--small',
            regular: 'gu-display__content-size--regular',
            big: 'gu-display__content-size--big'
        };
    };

    GustyleComcontent.prototype.create = function () {
        var externalLinkIcon = svgs('externalLink', ['gu-external-icon']),
            templateOptions = {
                articleContentColor: this.params.articleContentColor === 'white' ? 'gu-display__content-color--bright ' : 'gu-display__content-color--dark',
                articleContentPosition: this.contentPosition[this.params.articleContentPosition],
                articleHeaderFontSize: this.fontSize[this.params.articleHeaderFontSize],
                articleTextFontSize: this.fontSize[this.params.articleTextFontSize],
                brandLogoPosition: this.params.brandLogoPosition === 'bottom-right' ? 'gu-display__logo-pos--bottom-right' : 'gu-display__logo-pos--top-left',
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
