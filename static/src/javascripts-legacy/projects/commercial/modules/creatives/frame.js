define([
    'lib/fastdom-promise',
    'lib/template',
    'common/views/svgs',
    'common/modules/ui/toggles',
    'commercial/modules/creatives/add-tracking-pixel',
    'commercial/modules/creatives/add-viewability-tracker',
    'raw-loader!commercial/views/creatives/frame.html',
    'raw-loader!commercial/views/creatives/gustyle-label.html'
], function (
    fastdom,
    template,
    svgs,
    Toggles,
    addTrackingPixel,
    addViewabilityTracker,
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
        this.params.id = 'frame-' + (Math.random() * 10000 | 0).toString(16);

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
                addTrackingPixel(this.params.trackingPixel + this.params.cacheBuster);
            }
            if (this.params.researchPixel) {
                addTrackingPixel(this.params.researchPixel + this.params.cacheBuster);
            }
            if (this.params.viewabilityTracker) {
                addViewabilityTracker(this.$adSlot[0], this.params.id, this.params.viewabilityTracker);
            }
            new Toggles(this.$adSlot[0]).init();
            return true;
        }, this);
    };

    return Frame;

});
