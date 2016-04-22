define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/creatives/fabric-expanding-v1.html',
    'lodash/objects/merge',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'Promise'
], function (
    bean,
    bonzo,
    fastdom,
    $,
    detect,
    mediator,
    storage,
    template,
    svgs,
    FabricExpandingV1Html,
    merge,
    addTrackingPixel,
    Promise
) {
    var FabricExpandingV1 = function ($adSlot, params) {
        this.$adSlot      = $adSlot;
        this.params       = params;
        this.isClosed     = true;

        this.closedHeight = 250;
        this.openedHeight = 500;
    };

    FabricExpandingV1.prototype.create = function () {
        var videoHeight = this.openedHeight,
            showmoreArrow = {
                showArrow: (this.params.showMoreType === 'arrow-only' || this.params.showMoreType === 'plus-and-arrow') ?
                '<button class="ad-exp__open-chevron ad-exp__open">' + svgs('arrowdownicon') + '</button>' : ''
            },
            showmorePlus = {
                showPlus: (this.params.showMoreType === 'plus-only' || this.params.showMoreType === 'plus-and-arrow') ?
                '<button class="ad-exp__close-button ad-exp__open">' + svgs('closeCentralIcon') + '</button>' : ''
            },
            videoSource = {
                videoEmbed: (this.params.YoutubeVideoURL !== '') ?
                '<iframe id="YTPlayer" width="100%" height="' + videoHeight + '" src="' + this.params.YoutubeVideoURL + '?showinfo=0&amp;rel=0&amp;controls=0&amp;fs=0&amp;title=0&amp;byline=0&amp;portrait=0" frameborder="0" class="expandable-video"></iframe>' : ''
            },
            $ExpandableVideo = $.create(template(FabricExpandingV1Html, { data: merge(this.params, showmoreArrow, showmorePlus, videoSource) })),
            domPromise = new Promise(function (resolve) {
                fastdom.write(function () {

                    this.$ad = $('.ad-exp--expand', $ExpandableVideo).css('height', this.closedHeight);

                    $('.ad-exp-collapse__slide', $ExpandableVideo).css('height', this.closedHeight);

                    if (this.params.trackingPixel) {
                        addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
                    }
                    $ExpandableVideo.appendTo(this.$adSlot);
                    resolve();
                }.bind(this));
            }.bind(this));

        bean.on(this.$adSlot[0], 'click', '.ad-exp__open', function () {
            fastdom.write(function () {
                var videoSrc = $('#YTPlayer').attr('src'),
                    videoSrcAutoplay = videoSrc;
                if (videoSrc.indexOf('autoplay') === -1) {
                    videoSrcAutoplay = videoSrc + '&amp;autoplay=1';
                } else {
                    videoSrcAutoplay = videoSrcAutoplay.replace(this.isClosed ? 'autoplay=0' : 'autoplay=1', this.isClosed ? 'autoplay=1' : 'autoplay=0');
                }
                $('.ad-exp__close-button').toggleClass('button-spin');
                $('.ad-exp__open-chevron').removeClass('chevron-up').toggleClass('chevron-down');
                this.$ad.css('height', this.isClosed ? this.openedHeight : this.closedHeight);
                $('.slide-video, .slide-video .ad-exp__layer', $(this.$adSlot[0])).css('height', this.isClosed ? this.openedHeight : this.closedHeight).toggleClass('slide-video__expand');
                this.isClosed = !this.isClosed;
                setTimeout(function () {
                    $('#YTPlayer').attr('src', videoSrcAutoplay);
                }, 1000);
            }.bind(this));
        }.bind(this));

        return domPromise;
    };

    return FabricExpandingV1;

});
