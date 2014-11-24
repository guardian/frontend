define([
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'text!common/views/commercial/creatives/scrollable-mpu.html'
], function (
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
    ScrollableMpu.hasBgAttachmentFixed = !detect.isIOS() && !detect.isAndroid();

    ScrollableMpu.prototype.updateBgPosition = function () {
        this.$scrollableMpu.css('background-position', this.$scrollableMpu.offset().left + 'px 100%');

    };

    ScrollableMpu.prototype.create = function () {
        var templateOptions = {
            clickMacro:       this.params.clickMacro,
            destination:      this.params.destination,
            image:            ScrollableMpu.hasBgAttachmentFixed ? this.params.image : this.params.staticImage,
            trackingPixelImg: this.params.trackingPixel ?
                '<img src="' + this.params.trackingPixel + '" width="1" height="1" />' : ''
        };
        this.$scrollableMpu = $.create(template(scrollableMpuTpl, templateOptions)).appendTo(this.$adSlot);

        if (ScrollableMpu.hasBgAttachmentFixed) {
            this.$scrollableMpu.css('background-attachment', 'fixed');
            // update bg position
            this.updateBgPosition();
            // to be safe, also update on window resize
            mediator.on('window:resize', this.updateBgPosition.bind(this));
        }

    };

    return ScrollableMpu;

});
