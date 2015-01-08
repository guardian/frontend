define([
    'bean',
    'bonzo',
    'lodash/objects/merge',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'text!common/views/commercial/creatives/fluid250.html'
], function (
    bean,
    bonzo,
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
        };
        
        var leftMargin = (this.params.videoPositionH === 'center' ?
            -(this.params.videoWidth/2) : 0
        );
        
        var leftPosition = (this.params.videoPositionH === 'left' ?
            this.params.videoHorizSpace + 'px' : 'auto'
        );
        
        var rightPosition = (this.params.videoPositionH === 'right' ?
            this.params.videoHorizSpace + 'px' : 'auto'
        );
        
        var topMargin = (this.params.videoPositionV === 'center' ?
            -(this.params.videoHeight/2) : 0
        );
        
        var videoDesktop = {
            videoD: (this.params.videoURL !== '') ?
                '<iframe width="' + this.params.videoWidth + '" height="' + this.params.videoHeight + '" src="' + this.params.videoURL + '?rel=0&amp;controls=0&amp;showinfo=0&amp;title=0&amp;byline=0&amp;portrait=0" frameborder="0" class="fluid250_video fluid250_video--desktop fluid250_video--vert-pos-' + this.params.videoPositionV + ' fluid250_video--horiz-pos-' + this.params.videoPositionH + '" style="margin-left: ' + leftMargin + 'px; margin-top: ' + topMargin + 'px; left: ' + leftPosition + '; right: ' + rightPosition + ';"></iframe>' : ''
        };
        
        $.create(template(fluid250Tpl, merge(this.params, templateOptions, videoDesktop))).appendTo(this.$adSlot);

        if (this.params.trackingPixel) {
            this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
        }
        
        this.$adSlot.addClass('ad-slot__fluid250');
    };

    return Fluid250;

});
