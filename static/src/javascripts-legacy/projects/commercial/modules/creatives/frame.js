define([
    'lib/fastdom-promise',
    'lodash/utilities/template',
    'common/modules/ui/toggles',
    'common/views/svg',
    'commercial/modules/creatives/add-tracking-pixel',
    'commercial/modules/creatives/add-viewability-tracker',
    'raw-loader!commercial/views/creatives/frame.html',
    'raw-loader!commercial/views/creatives/gustyle-label.html',
    'svgs/icon/external-link.svg',
    'svgs/icon/arrow.svg'
], function (
    fastdom,
    template,
    Toggles,
    svg,
    addTrackingPixel,
    addViewabilityTracker,
    frameStr,
    labelStr,
    externalLink,
    arrow
) {

    var Frame = function (adSlot, params) {
        this.adSlot = adSlot;
        this.params = params;
    };

    Frame.prototype.create = function () {
        this.params.externalLinkIcon = svg.addClassesAndTitle(externalLink.markup, ['frame__external-link-icon']);
        this.params.target = this.params.newWindow === 'yes' ? '_blank' : '_self';
        this.params.id = 'frame-' + (Math.random() * 10000 | 0).toString(16);

        var frameMarkup = template(frameStr, { data: this.params });
        var labelMarkup = template(labelStr, { data: {
            buttonTitle: 'Ad',
            infoTitle: 'Advertising on the Guardian',
            infoText: 'is created and paid for by third parties.',
            infoLinkText: 'Learn more about how advertising supports the Guardian.',
            infoLinkUrl: 'https://www.theguardian.com/advertising-on-the-guardian',
            icon: svg.addClassesAndTitle(arrow.markup, ['gu-comlabel__icon']),
            dataAttr: this.adSlot.id
        }});
        return fastdom.write(function () {
            this.adSlot.insertAdjacentHTML('beforeend', frameMarkup);
            this.adSlot.lastElementChild.insertAdjacentHTML('afterbegin', labelMarkup);
            this.adSlot.classList.add('ad-slot--frame');
            if (this.params.trackingPixel) {
                addTrackingPixel.addTrackingPixel(this.params.trackingPixel + this.params.cacheBuster);
            }
            if (this.params.researchPixel) {
                addTrackingPixel.addTrackingPixel(this.params.researchPixel + this.params.cacheBuster);
            }
            if (this.params.viewabilityTracker) {
                addViewabilityTracker(this.adSlot, this.params.id, this.params.viewabilityTracker);
            }
            new Toggles(this.adSlot).init();
            return true;
        }, this);
    };

    return Frame;

});
