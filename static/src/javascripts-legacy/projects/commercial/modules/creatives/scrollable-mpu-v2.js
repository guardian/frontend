define([
    'Promise',
    'fastdom',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'raw-loader!commercial/views/creatives/scrollable-mpu-v2.html',
    'commercial/modules/creatives/add-tracking-pixel',
    'commercial/modules/creatives/add-viewability-tracker',
    'lodash/functions/bindAll'
], function (
    Promise,
    fastdom,
    $,
    detect,
    mediator,
    template,
    scrollableMpuTpl,
    addTrackingPixel,
    addViewabilityTracker,
    bindAll
) {

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10026567
     */
    var ScrollableMpu = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
        bindAll(this, 'updateBgPosition');
    };

    /**
     * TODO: rather blunt instrument this, due to the fact *most* mobile devices don't have a fixed
     * background-attachment - need to make this more granular
     */
    ScrollableMpu.hasScrollEnabled = !detect.isIOS() && !detect.isAndroid();

    ScrollableMpu.prototype.updateBgPosition = function () {
        var that = this;

        switch (this.params.backgroundImagePType) {
            case 'fixed matching fluid250':
                fastdom.write(function () {
                    $('.creative--scrollable-mpu-image', $(that.$adSlot)).addClass('creative--scrollable-mpu-image-fixed');
                });
                break;
            case 'parallax':
                this.scrollAmount = Math.ceil((window.pageYOffset - this.$adSlot.offset().top) * 0.3 * -1) + 20;
                this.scrollAmountP = this.scrollAmount + '%';
                fastdom.write(function () {
                    $('.creative--scrollable-mpu-image', $(that.$adSlot)).addClass('creative--scrollable-mpu-image-parallax').css('background-position', '50%' + that.scrollAmountP);
                });
                break;
            default:
                var position = window.pageYOffset - this.$scrollableMpu.offset().top;
                fastdom.write(function () {
                    $('.creative--scrollable-mpu-image', $(that.$adSlot)).css('background-position', '100% ' + position + 'px');
                });
        }
    };

    ScrollableMpu.prototype.create = function () {
        var templateOptions = {
            id:               'scrollable-mpu-' + (Math.random() * 10000 | 0).toString(16),
            clickMacro:       this.params.clickMacro,
            destination:      this.params.destination,
            layer1Image:      ScrollableMpu.hasScrollEnabled ? this.params.layer1Image : this.params.mobileImage,
            backgroundImage:       ScrollableMpu.hasScrollEnabled && this.params.backgroundImage ?
                '<div class="creative--scrollable-mpu-image" style="background-image: url(' + this.params.backgroundImage + ');"></div>' : ''
        };
        this.$scrollableMpu = $.create(template(scrollableMpuTpl, templateOptions)).appendTo(this.$adSlot);

        if (this.params.trackingPixel) {
            addTrackingPixel(this.params.trackingPixel + this.params.cacheBuster)
        }

        if (this.params.researchPixel) {
            addTrackingPixel(this.params.researchPixel + this.params.cacheBuster);
        }

        if (this.params.viewabilityTracker) {
            addViewabilityTracker(this.$adSlot[0], this.params.id, this.params.viewabilityTracker);
        }

        if (ScrollableMpu.hasScrollEnabled) {
            // update bg position
            fastdom.read(this.updateBgPosition);

            mediator.on('window:throttledScroll', this.updateBgPosition);
            // to be safe, also update on window resize
            mediator.on('window:throttledResize', this.updateBgPosition);
        }

        return Promise.resolve(true);
    };

    return ScrollableMpu;

});
