define([
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/views/svgs',
    'common/modules/commercial/gustyle/gustyle',
    'template!common/views/commercial/creatives/gu-style-comcontent.html',
    'template!common/views/commercial/creatives/gu-style-hosted.html',
    'lodash/objects/merge',
    'common/modules/commercial/creatives/add-tracking-pixel'
], function (
    fastdom,
    $,
    detect,
    mediator,
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
        var markup = templateToLoad({ data: merge(this.params, templateOptions) });
        var gustyle = new GuStyle(this.$adSlot, this.params);

        return fastdom.write(function () {
            this.$adSlot[0].insertAdjacentHTML('beforeend', markup);

            if (this.params.trackingPixel) {
                addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
            }
        }, this).then(gustyle.addLabel.bind(gustyle));
    };

    return GustyleComcontent;

});
