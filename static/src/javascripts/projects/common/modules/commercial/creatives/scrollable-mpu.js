define([
    'fastdom',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'ldsh!common/views/commercial/creatives/scrollable-mpu.html',
    'lodash/functions/bindAll'
], function (
    fastdom,
    $,
    detect,
    mediator,
    scrollableMpuTpl,
    bindAll) {

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
        var position = window.pageYOffset - this.$scrollableMpu.offset().top;
        fastdom.write(function () {
            $('.creative--scrollable-mpu-image').css('background-position', '100% ' + position + 'px');
        });
    };

    ScrollableMpu.prototype.create = function () {
        var templateOptions = {
            clickMacro:       this.params.clickMacro,
            destination:      this.params.destination,
            image:            ScrollableMpu.hasScrollEnabled ? this.params.image : this.params.staticImage,
            stillImage:       ScrollableMpu.hasScrollEnabled && this.params.stillImage ?
                '<div class="creative--scrollable-mpu-static-image" style="background-image: url(' + this.params.stillImage + ');"></div>' : '',
            trackingPixelImg: this.params.trackingPixel ?
                '<img src="' + this.params.trackingPixel + '" width="1" height="1" />' : ''
        };
        this.$scrollableMpu = $.create(scrollableMpuTpl(templateOptions)).appendTo(this.$adSlot);

        if (ScrollableMpu.hasScrollEnabled) {
            // update bg position
            fastdom.read(this.updateBgPosition);

            mediator.on('window:throttledScroll', this.updateBgPosition);
            // to be safe, also update on window resize
            mediator.on('window:resize', this.updateBgPosition);
        }
    };

    return ScrollableMpu;

});
