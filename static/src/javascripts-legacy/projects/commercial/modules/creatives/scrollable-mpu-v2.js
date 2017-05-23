define([
    'fastdom',
    'lib/$',
    'lib/detect',
    'lib/mediator',
    'lodash/utilities/template',
    'raw-loader!commercial/views/creatives/scrollable-mpu-v2.html',
    'commercial/modules/creatives/add-tracking-pixel',
    'commercial/modules/creatives/add-viewability-tracker'
], function (
    fastdom,
    $,
    detect,
    mediator,
    template,
    scrollableMpuTpl,
    addTrackingPixel,
    addViewabilityTracker
) {

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10026567
     */
    var ScrollableMpu = function (adSlot, params) {
        this.adSlot = adSlot;
        this.params = params;
    };

    /**
     * TODO: rather blunt instrument this, due to the fact *most* mobile devices don't have a fixed
     * background-attachment - need to make this more granular
     */
    var hasScrollEnabled = !detect.isAndroid();

    function updateBgFluid250() {
        fastdom.write(function () {
            this.$scrollableImage.addClass('creative--scrollable-mpu-image-fixed');
        }, this);
    }

    function updateBgParallax() {
        var scrollAmount = Math.ceil(this.adSlot.getBoundingClientRect().top * 0.3) + 20;
        fastdom.write(function () {
            this.$scrollableImage
            .addClass('creative--scrollable-mpu-image-parallax')
            .css('background-position', '50% ' + scrollAmount + '%');
        }, this);
    }

    function updateBg() {
        var position = -this.$scrollableMpu[0].getBoundingClientRect().top;
        fastdom.write(function () {
            this.$scrollableImage.css('background-position', '100% ' + position + 'px');
        }, this);
    }

    ScrollableMpu.prototype.create = function () {
        var templateOptions = {
            id:               'scrollable-mpu-' + (Math.random() * 10000 | 0).toString(16),
            clickMacro:       this.params.clickMacro,
            destination:      this.params.destination,
            layer1Image:      hasScrollEnabled ? this.params.layer1Image : this.params.mobileImage,
            backgroundImage:  hasScrollEnabled && this.params.backgroundImage ?
                '<div class="creative--scrollable-mpu-image" style="background-image: url(' + this.params.backgroundImage + ');"></div>' : ''
        };
        this.$scrollableMpu = $.create(template(scrollableMpuTpl, templateOptions)).appendTo(this.adSlot);

        if (this.params.trackingPixel) {
            addTrackingPixel.addTrackingPixel(this.params.trackingPixel + this.params.cacheBuster)
        }

        if (this.params.researchPixel) {
            addTrackingPixel.addTrackingPixel(this.params.researchPixel + this.params.cacheBuster);
        }

        if (this.params.viewabilityTracker) {
            addViewabilityTracker(this.adSlot, this.params.id, this.params.viewabilityTracker);
        }

        if (hasScrollEnabled) {
            var updateFn =
                this.params.backgroundImagePType === 'fixed matching fluid250' ?
                    updateBgFluid250.bind(this) :
                this.params.backgroundImagePType === 'parallax' ?
                    updateBgParallax.bind(this) :
                    updateBg.bind(this);

            this.$scrollableImage = $('.creative--scrollable-mpu-image', this.adSlot);

            // update bg position
            fastdom.read(updateFn);

            mediator.on('window:throttledScroll', updateFn);
            // to be safe, also update on window resize
            mediator.on('window:throttledResize', updateFn);
        }

        return Promise.resolve(true);
    };

    return ScrollableMpu;

});
