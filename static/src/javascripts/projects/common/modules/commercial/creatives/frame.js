define([
    'common/utils/fastdom-promise',
    'common/utils/template',
    'common/views/svgs',
    'common/modules/ui/toggles',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'text!common/views/commercial/creatives/frame.html',
    'text!common/views/commercial/gustyle/label.html'
], function (
    fastdom,
    template,
    svgs,
    Toggles,
    addTrackingPixel,
    frameStr,
    labelStr
) {

    var Frame = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
    };

    Frame.prototype.create = function () {
        this.params.externalLinkIcon = svgs('externalLink', ['gu-external-icon']);
        this.params.target = this.params.newWindow === 'yes' ? '_blank' : '_self';

        var frameMarkup = template(frameStr, { data: this.params });
        var labelMarkup = template(labelStr, { data: {
            buttonTitle: 'Ad',
            infoTitle: 'Advertising on the Guardian',
            infoText: 'is created and paid for by third parties.',
            infoLinkText: 'Learn more about how advertising supports the Guardian.',
            infoLinkUrl: 'https://www.theguardian.com/advertising-on-the-guardian',
            icon: svgs('arrowicon', ['gu-comlabel__icon']),
            dataAttr: this.$adSlot[0].id
        }});
        return fastdom.write(function () {
            this.$adSlot[0].insertAdjacentHTML('beforeend', frameMarkup);
            this.$adSlot[0].lastElementChild.insertAdjacentHTML('afterbegin', labelMarkup);
            this.$adSlot.addClass('ad-slot--frame');
            if (this.params.trackingPixel) {
                addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
            }
            new Toggles(this.$adSlot[0]).init();
        }, this);
    };

    return Frame;

});
