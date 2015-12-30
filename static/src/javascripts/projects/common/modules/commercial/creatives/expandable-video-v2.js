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
    'text!common/views/commercial/creatives/expandable-video-v2.html',
    'lodash/objects/merge'
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
    ExpandableVideoTpl,
    merge) {

    var ExpandableVideo = function ($adSlot, params) {
        this.$adSlot      = $adSlot;
        this.params       = params;
        this.isClosed     = true;

        if (detect.isBreakpoint({min: 'tablet'})) {
            this.closedHeight = 250;
            this.openedHeight = 500;
        } else {
            this.closedHeight = 150;
            this.openedHeight = 300;
        }

        if (typeof ExpandableVideoTpl === 'string') {
            ExpandableVideoTpl = template(ExpandableVideoTpl);
        }
    };

    ExpandableVideo.prototype.create = function () {
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
            $ExpandableVideo = $.create(ExpandableVideoTpl({ data: merge(this.params, showmoreArrow, showmorePlus, videoSource) })),
            domPromise = new Promise(function (resolve) {
                fastdom.write(function () {

                    this.$ad = $('.ad-exp--expand', $ExpandableVideo).css('height', this.closedHeight);

                    $('.ad-exp-collapse__slide', $ExpandableVideo).css('height', this.closedHeight);

                    if (this.params.trackingPixel) {
                        this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
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

    return ExpandableVideo;

});
