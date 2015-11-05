define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250-v3.html',
    'lodash/functions/bindAll',
    'lodash/objects/merge'
], function (
    bean,
    bonzo,
    fastdom,
    $,
    detect,
    mediator,
    storage,
    template,
    fluid250Tpl,
    bindAll,
    merge) {
    var Fluid250 = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;

        bindAll(this, 'updateBgPosition');
    };

    Fluid250.hasScrollEnabled = !detect.isIOS() && !detect.isAndroid();

    Fluid250.isModernBrowser = detect.isModernBrowser();

    Fluid250.isIE9OrLess = detect.getUserAgent.browser === 'MSIE' && (detect.getUserAgent.version === '9' || detect.getUserAgent.version === '8');

    Fluid250.prototype.updateBgPosition = function () {
        var that = this;
        switch (this.params.backgroundImagePType) {
            case 'fixed':
                break;
            case 'parallax':
                this.scrollAmount = Math.ceil((window.pageYOffset - this.$adSlot.offset().top) * 0.3 * -1) + 20;
                this.scrollAmountP = this.scrollAmount + '%';
                fastdom.write(function () {
                    $('.ad-scrolling-bg', $(that.$adSlot)).addClass('ad-scrolling-bg-parallax').css('background-position', '50%' + that.scrollAmountP);
                });
                break;
        }

        this.layer2Animation();
    };

    Fluid250.prototype.layer2Animation = function () {
        var inViewB,
            that = this;
        if (this.params.layerTwoAnimation === 'enabled' && Fluid250.isModernBrowser && !Fluid250.isIE9OrLess) {
            fastdom.read(function () {
                inViewB = (window.pageYOffset + bonzo.viewport().height) > that.$adSlot.offset().top;
            });
            fastdom.write(function () {
                $('.hide-until-tablet .fluid250_layer2', $(that.$adSlot)).addClass('ad-scrolling-text-hide');
                if (inViewB) {
                    $('.hide-until-tablet .fluid250_layer2', $(that.$adSlot)).addClass('ad-scrolling-text-animate');
                }
            });
        }
    };

    Fluid250.prototype.create = function () {
        var templateOptions = {
                showLabel: (this.params.showAdLabel === 'hide') ?
                'creative__label--hidden' : '',

                layerTwoBGProperties: (!this.params.layerTwoAnimation || this.params.layerTwoAnimation === '' || this.params.layerTwoAnimation === 'disabled' || (!Fluid250.isModernBrowser && this.params.layerTwoAnimation === 'enabled')) ?
                ' background-position: ' + this.params.layerTwoBGPosition + ';' : ''
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
            scrollingbg = {
                scrollbg: (this.params.backgroundImagePType !== '' || this.params.backgroundImagePType !== 'none') ?
                    '<div class="ad-scrolling-bg" style="background-image: url(' + this.params.backgroundImageP + '); background-position: 50% 0; background-repeat: ' + this.params.backgroundImagePRepeat + ';"></div>' : ''
            };

        $.create(template(fluid250Tpl, { data: merge(this.params, templateOptions, videoDesktop, scrollingbg) })).appendTo(this.$adSlot);

        if (this.params.trackingPixel) {
            this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
        }

        if (Fluid250.hasScrollEnabled) {
            // update bg position
            fastdom.read(this.updateBgPosition);

            mediator.on('window:throttledScroll', this.updateBgPosition);
            // to be safe, also update on window resize
            mediator.on('window:resize', this.updateBgPosition);
        }
    };

    return Fluid250;

});
