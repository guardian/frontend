define([
    'bean',
    'bonzo',
    'fastdom',
    'lodash/objects/merge',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250.html'
], function (
    bean,
    bonzo,
    fastdom,
    merge,
    $,
    mediator,
    storage,
    template,
    fluid250Tpl
) {
    var Fluid250 = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params = params;
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
            },
            ad = $.create(template(fluid250Tpl, merge(this.params, templateOptions, videoDesktop)));

        fastdom.write(function () {
            ad.appendTo(this.$adSlot);
        }.bind(this));

        if (this.params.trackingPixel) {
            fastdom.write(function () {
                this.$adSlot.before(
                    '<img src="' + this.params.trackingPixel + this.params.cacheBuster +
                    '" class="creative__tracking-pixel" height="1px" width="1px"/>'
                );
            }.bind(this));
        }
    };

    return Fluid250;
});
