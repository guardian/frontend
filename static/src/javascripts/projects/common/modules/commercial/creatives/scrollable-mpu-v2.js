define([
    'fastdom',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/views/commercial/creatives/scrollable-mpu-v2.html!text'
], function (
    fastdom,
    $,
    detect,
    mediator,
    template,
    scrollableMpuTpl
) {

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10026567
     */
    var ScrollableMpu = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
    };

    /**
     * TODO: rather blunt instrument this, due to the fact *most* mobile devices don't have a fixed
     * background-attachment - need to make this more granular
     */
    ScrollableMpu.hasScrollEnabled = !detect.isIOS() && !detect.isAndroid();

    ScrollableMpu.prototype.updateBgPosition = function () {

        switch (this.params.backgroundImagePType) {
            case 'fixed matching fluid250':
                fastdom.write(function () {
                    $('.creative--scrollable-mpu-image', $(this.$adSlot)).addClass('creative--scrollable-mpu-image-fixed');
                }.bind(this));
                break;
            case 'parallax':
                fastdom.read(function () {
                    this.scrollAmount = Math.ceil((window.pageYOffset - this.$adSlot.offset().top) * 0.3 * -1) + 20;
                    this.scrollAmountP = this.scrollAmount + '%';
                }.bind(this));
                fastdom.write(function () {
                    $('.creative--scrollable-mpu-image', $(this.$adSlot)).addClass('creative--scrollable-mpu-image-parallax').css('background-position', '50%' + this.scrollAmountP);
                }.bind(this));
                break;
            default:
                fastdom.write(function () {
                    $('.creative--scrollable-mpu-image', $(this.$adSlot)).css('background-position', '100%' + (window.pageYOffset - this.$scrollableMpu.offset().top) + 'px');
                }.bind(this));
        }
    };

    ScrollableMpu.prototype.create = function () {
        var templateOptions = {
            clickMacro:       this.params.clickMacro,
            destination:      this.params.destination,
            layer1Image:      ScrollableMpu.hasScrollEnabled ? this.params.layer1Image : this.params.mobileImage,
            backgroundImage:       ScrollableMpu.hasScrollEnabled && this.params.backgroundImage ?
                '<div class="creative--scrollable-mpu-image" style="background-image: url(' + this.params.backgroundImage + ');"></div>' : '',
            trackingPixelImg: this.params.trackingPixel ?
                '<img src="' + this.params.trackingPixel + '" width="1" height="1" />' : ''
        };
        this.$scrollableMpu = $.create(template(scrollableMpuTpl, templateOptions)).appendTo(this.$adSlot);

        if (ScrollableMpu.hasScrollEnabled) {
            // update bg position
            this.updateBgPosition();

            mediator.on('window:scroll', this.updateBgPosition.bind(this));
            // to be safe, also update on window resize
            mediator.on('window:resize', this.updateBgPosition.bind(this));
        }
    };

    return ScrollableMpu;

});
