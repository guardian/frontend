define([
    'bean',
    'bonzo',
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
        var bgpositionx = this.params.backgroundPosition.split(' ')[0],
        layeronebgpositionx = this.params.layerOneBGPosition.split(' ')[0],
        layertwobgpositionx = this.params.layerTwoBGPosition.split(' ')[0],
        layerthreebgpositionx = this.params.layerThreeBGPosition.split(' ')[0];

        $('.ad-slot--top-banner-ad .creative--fluid250').css('background-position', bgpositionx + ' ' + window.pageYOffset * (this.params.backgroundImageScroll / 100) + 'px').css('background-repeat', 'repeat-y');
        $('.ad-slot--top-banner-ad .creative--fluid250 .fluid250_layer1').css('background-position', layeronebgpositionx + ' ' + window.pageYOffset * (this.params.layerOneImageScroll / 100) + 'px').css('background-repeat', 'repeat-y');
        $('.ad-slot--top-banner-ad .creative--fluid250 .fluid250_layer2').css('background-position', layertwobgpositionx + ' ' + window.pageYOffset * (this.params.layerTwoImageScroll / 100) + 'px').css('background-repeat', 'repeat-y');
        $('.ad-slot--top-banner-ad .creative--fluid250 .fluid250_layer3').css('background-position', layerthreebgpositionx + ' ' + window.pageYOffset * (this.params.layerThreeImageScroll / 100) + 'px').css('background-repeat', 'repeat-y');
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
            };

        this.$fluid250 = $.create(template(fluid250Tpl, _.merge(this.params, templateOptions, videoDesktop))).appendTo(this.$adSlot);

        if (this.params.trackingPixel) {
            this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
        }

        if (Fluid250.hasScrollEnabled && (this.params.backgroundImageScroll !== 'normal' || this.params.layerOneImageScroll !== 'normal'  || this.params.layerTwoImageScroll !== 'normal'  || this.params.layerThreeImageScroll !== 'normal')) {

            // update bg position
            this.updateBgPosition();

            mediator.on('window:scroll', this.updateBgPosition.bind(this));
            // to be safe, also update on window resize
            mediator.on('window:resize', this.updateBgPosition.bind(this));
        }
    };

    return Fluid250;

});
