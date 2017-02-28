define([
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/config',
    'common/utils/template',
    'common/views/svgs',
    'commercial/modules/creatives/gustyle',
    'raw-loader!commercial/views/creatives/gu-style-comcontent.html',
    'raw-loader!commercial/views/creatives/gu-style-hosted.html',
    'lodash/objects/merge',
    'commercial/modules/creatives/add-tracking-pixel'
], function (
    fastdom,
    $,
    detect,
    mediator,
    config,
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

    var isDark = function(hex) {
        var colour = (hex.charAt(0) == '#') ? hex.substring(1, 7) : hex;
        var R = parseInt(colour.substring(0, 2), 16);
        var G = parseInt(colour.substring(2, 4), 16);
        var B = parseInt(colour.substring(4, 6), 16);

        var min = Math.min(Math.min(R, G), B);
        var max = Math.max(Math.max(R, G), B);
        var lightness = (min + max) / 510;
        return lightness < 0.5;

    };

    GustyleComcontent.prototype.create = function () {
        var brandColor = this.params.brandColor;
        var externalLinkIcon = svgs('externalLink', ['gu-external-icon']),
            templateOptions = {
                articleContentColor: 'gu-display__content-color--' + this.params.articleContentColor,
                articleContentPosition: 'gu-display__content-position--' + this.params.articleContentPosition,
                articleHeaderFontSize: 'gu-display__content-size--' + this.params.articleHeaderFontSize,
                articleTextFontSize: 'gu-display__content-size--' + this.params.articleTextFontSize,
                brandLogoPosition: 'gu-display__logo-pos--' + this.params.brandLogoPosition,
                externalLinkIcon: externalLinkIcon,
                contrastFontColour: brandColor && isDark(brandColor) ? 'gu-display__hosted-bright' : '',
                isHostedBottom: this.params.adType === 'gu-style-hosted-bottom'
            };
        var templateToLoad = this.params.adType === 'gu-style' ? gustyleComcontentTpl : gustyleHostedTpl;

        var title = this.params.articleHeaderText || 'unknown';
        var sponsor = 'Renault';
        this.params.linkTracking = 'Labs hosted native traffic card' +
            ' | ' + config.page.edition +
            ' | ' + config.page.section +
            ' | ' + title +
            ' | ' + sponsor;

        var markup = template(templateToLoad, { data: merge(this.params, templateOptions) });
        var gustyle = new GuStyle(this.$adSlot, this.params);

        return fastdom.write(function () {
            this.$adSlot[0].insertAdjacentHTML('beforeend', markup);

            if (this.params.trackingPixel) {
                addTrackingPixel(this.params.trackingPixel + this.params.cacheBuster);
            }
        }, this).then(gustyle.addLabel.bind(gustyle)).then(function () {
            return true;
        });
    };

    return GustyleComcontent;

});
