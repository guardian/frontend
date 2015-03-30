define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/_',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250.html'
], function (
    bean,
    bonzo,
    fastdom,
    _,
    $,
    detect,
    mediator,
    storage,
    template,
    fluid250Tpl
) {
    var Fluid250 = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
    };

    /**
     * TODO: rather blunt instrument this, due to the fact *most* mobile devices don't have a fixed
     * background-attachment - need to make this more granular
     */
    Fluid250.hasScrollEnabled = !detect.isIOS() && !detect.isAndroid();

    Fluid250.prototype.updateBgPosition = function () {

        var bgpositionx, layeronebgpositionx, layertwobgpositionx, layerthreebgpositionx;

        if (!!this.params.backgroundPosition && !!this.params.backgroundImageScroll) {
            bgpositionx = this.params.backgroundPosition.split(' ')[0];
            fastdom.write(function () {
                $('.ad-slot--top-banner-ad .creative--fluid250').css('background-position', bgpositionx + ' ' + window.pageYOffset * (this.params.backgroundImageScroll / 100) + 'px').css('background-repeat', 'repeat-y');
            }.bind(this));
        }
        if (!!this.params.layerOneBGPosition && this.params.layerOneImageScroll) {
            layeronebgpositionx = this.params.layerOneBGPosition.split(' ')[0];
            fastdom.write(function () {
                $('.ad-slot--top-banner-ad .creative--fluid250 .fluid250_layer1').css('background-position', layeronebgpositionx + ' ' + window.pageYOffset * (this.params.layerOneImageScroll / 100) + 'px').css('background-repeat', 'repeat-y');
            }.bind(this));
        }
        if (!!this.params.layerTwoBGPosition && this.params.layerTwoImageScroll) {
            layertwobgpositionx = this.params.layerTwoBGPosition.split(' ')[0];
            fastdom.write(function () {
                $('.ad-slot--top-banner-ad .creative--fluid250 .fluid250_layer2').css('background-position', layertwobgpositionx + ' ' + window.pageYOffset * (this.params.layerTwoImageScroll / 100) + 'px').css('background-repeat', 'repeat-y');
            }.bind(this));
        }
        if (!!this.params.layerThreeBGPosition && this.params.layerThreeImageScroll) {
            layerthreebgpositionx = this.params.layerThreeBGPosition.split(' ')[0];
            fastdom.write(function () {
                $('.ad-slot--top-banner-ad .creative--fluid250 .fluid250_layer3').css('background-position', layerthreebgpositionx + ' ' + window.pageYOffset * (this.params.layerThreeImageScroll / 100) + 'px').css('background-repeat', 'repeat-y');
            }.bind(this));
        }
    };

    Fluid250.prototype.create = function () {

        var templateOptions = {
                showLabel: (this.params.showAdLabel === 'hide') ?
                'creative__label--hidden' : ''
            },
            leftPosition = (this.params.videoPositionH === 'left' ?
                ' left: ' + this.params.videoHorizSpace + 'px;' : ''
            ),
            rightPosition = (this.params.videoPositionH === 'right' ?
                ' right: ' + this.params.videoHorizSpace + 'px;' : ''
            ),
            videoDesktop = {
                video: (this.params.videoURL !== '') ?
                    '<iframe width="409px" height="230px" src="' + this.params.videoURL + '?rel=0&amp;controls=0&amp;showinfo=0&amp;title=0&amp;byline=0&amp;portrait=0" frameborder="0" class="fluid250_video fluid250_video--desktop fluid250_video--vert-pos-' + this.params.videoPositionV + ' fluid250_video--horiz-pos-' + this.params.videoPositionH + '" style="' + leftPosition + rightPosition + '"></iframe>' : ''
            },
            ad = $.create(template(fluid250Tpl, _.merge(this.params, templateOptions, videoDesktop)));

        fastdom.write(function () {
            ad.appendTo(this.$adSlot);
        }.bind(this));

        if (this.params.trackingPixel) {
            fastdom.write(function () {
                this.$adSlot.before(
                    '<img src="' + this.params.trackingPixel + this.params.cacheBuster +
                    '" class="creative__tracking-pixel" height="1px" width="1px"/>'
                );
            }.bind(this));
        }

        if (Fluid250.hasScrollEnabled && (!isNaN(this.params.backgroundImageScroll) ||
        !isNaN(this.params.layerOneImageScroll) ||
        !isNaN(this.params.layerTwoImageScroll) ||
        !isNaN(this.params.layerThreeImageScroll))) {

            // update bg position
            this.updateBgPosition();

            mediator.on('window:scroll', this.updateBgPosition.bind(this));
            // to be safe, also update on window resize
            mediator.on('window:resize', this.updateBgPosition.bind(this));
        }
    };

    return Fluid250;

});
