define([
    'bean',
    'bonzo',
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'common/views/svgs',
    'raw-loader!commercial/views/creatives/fabric-expandable-video-v1.html',
    'lodash/objects/merge',
    'commercial/modules/creatives/add-tracking-pixel',
    'commercial/modules/creatives/add-viewability-tracker'
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
    fabricExpandableVideoHtml,
    merge,
    addTrackingPixel,
    addViewabilityTracker
) {
    // Forked from expandable-video-v2.js

    var FabricExpandableVideoV1 = function ($adSlot, params) {
        this.$adSlot      = $adSlot;
        this.params       = params;
        this.isClosed     = true;
        this.closedHeight = 250;
        this.openedHeight = 500;
    };

    FabricExpandableVideoV1.prototype.create = function () {
        var videoHeight = this.openedHeight;
        var showmoreArrow = {
            showArrow: (this.params.showMoreType === 'arrow-only' || this.params.showMoreType === 'plus-and-arrow') ?
                '<button class="ad-exp__open-chevron ad-exp__open">' + svgs('arrowdownicon') + '</button>'
                : ''
        };
        var showmorePlus = {
            showPlus: (this.params.showMoreType === 'plus-only' || this.params.showMoreType === 'plus-and-arrow') ?
                '<button class="ad-exp__close-button ad-exp__open">' + svgs('closeCentralIcon') + '</button>'
                : ''
        };
        var videoSource = {
            videoEmbed: (this.params.YoutubeVideoURL !== '') ?
                '<iframe id="YTPlayer" width="100%" height="' + videoHeight + '" src="' + this.params.YoutubeVideoURL + '?showinfo=0&amp;rel=0&amp;controls=0&amp;fs=0&amp;title=0&amp;byline=0&amp;portrait=0" frameborder="0" class="expandable-video"></iframe>'
                : ''
        };
        this.params.id = 'fabric-expandable-' + (Math.random() * 10000 | 0).toString(16);
        var $fabricExpandableVideo = $.create(template(fabricExpandableVideoHtml, { data: merge(this.params, showmoreArrow, showmorePlus, videoSource) }));
        var $ad = $('.ad-exp--expand', $fabricExpandableVideo);

        bean.on(this.$adSlot[0], 'click', '.ad-exp__open', function () {
            fastdom.write(function () {
                var videoSrc = $('#YTPlayer').attr('src');
                var videoSrcAutoplay = videoSrc;

                if (videoSrc.indexOf('autoplay') === -1) {
                    videoSrcAutoplay = videoSrc + '&amp;autoplay=1';
                } else {
                    videoSrcAutoplay = videoSrcAutoplay.replace(
                        this.isClosed ? 'autoplay=0' : 'autoplay=1',
                        this.isClosed ? 'autoplay=1' : 'autoplay=0'
                    );
                }

                $('.ad-exp__close-button').toggleClass('button-spin');
                $('.ad-exp__open-chevron').removeClass('chevron-up').toggleClass('chevron-down');
                $ad.css(
                    'height',
                    this.isClosed ? this.openedHeight : this.closedHeight
                );
                $('.slide-video, .slide-video .ad-exp__layer', $(this.$adSlot[0]))
                    .css('height', this.isClosed ? this.openedHeight : this.closedHeight)
                    .toggleClass('slide-video__expand');

                this.isClosed = !this.isClosed;

                setTimeout(function () {
                    $('#YTPlayer').attr('src', videoSrcAutoplay);
                }, 1000);

            }.bind(this));
        }.bind(this));

        return fastdom.write(function () {
            $ad.css('height', this.closedHeight);
            $('.ad-exp-collapse__slide', $fabricExpandableVideo).css('height', this.closedHeight);
            if (this.params.trackingPixel) {
                addTrackingPixel(this.params.trackingPixel + this.params.cacheBuster);
            }
            if (this.params.researchPixel) {
                addTrackingPixel(this.params.researchPixel + this.params.cacheBuster);
            }
            $fabricExpandableVideo.appendTo(this.$adSlot);
            if (this.params.viewabilityTracker) {
                addViewabilityTracker(this.$adSlot[0], this.params.id, this.params.viewabilityTracker);
            }
            this.$adSlot.addClass('ad-slot--fabric');
            if( this.$adSlot.parent().hasClass('top-banner-ad-container') ) {
                this.$adSlot.parent().addClass('top-banner-ad-container--fabric');
            }
            return true;
        }, this);
    };

    return FabricExpandableVideoV1;
});
