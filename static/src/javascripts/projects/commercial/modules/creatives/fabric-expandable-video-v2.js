define([
    'bean',
    'bonzo',
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/assign',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'common/views/svgs',
    'text!commercial/views/creatives/fabric-expandable-video-v1.html',
    'text!commercial/views/creatives/fabric-expandable-video-v2-cta.html',
    'commercial/modules/creatives/add-tracking-pixel'
], function (
    bean,
    bonzo,
    fastdom,
    $,
    detect,
    assign,
    mediator,
    storage,
    template,
    svgs,
    fabricExpandableVideoHtml,
    fabricExpandableCtaHtml,
    addTrackingPixel
) {
    return FabricExpandableVideoV2;

    function FabricExpandableVideoV2($adSlot, params) {
        var isClosed     = true;
        var closedHeight = 250;
        var openedHeight = 500;

        var ctaTpl = template(fabricExpandableCtaHtml);

        return Object.freeze({ create: create });

        function create() {
            var videoHeight = openedHeight;
            var additionalParams = {
                destkopCTA: params.ctaDesktopImage ? ctaTpl({ link: params.link, image: params.ctaDesktopImage, position: params.ctaDesktopPosition }): '',
                mobileCTA: params.ctaMobileImage ? ctaTpl({ link: params.link, image: params.ctaMobileImage, position: params.ctaMobilePosition }): '',
                showArrow: (params.showMoreType === 'arrow-only' || params.showMoreType === 'plus-and-arrow') ?
                    '<button class="ad-exp__open-chevron ad-exp__open">' + svgs('arrowdownicon') + '</button>'
                    : '',
                showPlus: (params.showMoreType === 'plus-only' || params.showMoreType === 'plus-and-arrow') && params.showCrossInContainer === 'false' ?
                    '<button class="ad-exp__close-button ad-exp__open">' + svgs('closeCentralIcon') + '</button>'
                    : '',
                showPlusInContainer: (params.showMoreType === 'plus-only' || params.showMoreType === 'plus-and-arrow') && params.showCrossInContainer === 'true' ?
                    '<button class="ad-exp__close-button ad-exp__open">' + svgs('closeCentralIcon') + '</button>'
                    : '',
                videoEmbed: (params.YoutubeVideoURL !== '') ?
                    '<iframe id="YTPlayer" width="100%" height="' + videoHeight + '" src="' + params.YoutubeVideoURL + '?showinfo=0&amp;rel=0&amp;controls=0&amp;fs=0&amp;title=0&amp;byline=0&amp;portrait=0" frameborder="0" class="expandable-video"></iframe>'
                    : ''
            };
            var $fabricExpandableVideo = $.create(template(fabricExpandableVideoHtml, { data: assign(params, additionalParams) }));
            var $ad = $('.ad-exp--expand', $fabricExpandableVideo);

            bean.on($adSlot[0], 'click', '.ad-exp__open', function () {
                fastdom.write(function () {
                    var videoSrc = $('#YTPlayer').attr('src');
                    var videoSrcAutoplay = videoSrc;

                    if (videoSrc.indexOf('autoplay') === -1) {
                        videoSrcAutoplay = videoSrc + '&amp;autoplay=1';
                    } else {
                        videoSrcAutoplay = videoSrcAutoplay.replace(
                            isClosed ? 'autoplay=0' : 'autoplay=1',
                            isClosed ? 'autoplay=1' : 'autoplay=0'
                        );
                    }

                    $('.ad-exp__close-button', $adSlot[0]).toggleClass('button-spin');
                    $('.ad-exp__open-chevron', $adSlot[0]).removeClass('chevron-up').toggleClass('chevron-down');
                    $ad.css(
                        'height',
                        isClosed ? openedHeight : closedHeight
                    );
                    $('.slide-video, .slide-video .ad-exp__layer', $adSlot[0])
                        .css('height', isClosed ? openedHeight : closedHeight)
                        .toggleClass('slide-video__expand');

                    isClosed = !isClosed;

                    setTimeout(function () {
                        $('#YTPlayer').attr('src', videoSrcAutoplay);
                    }, 1000);

                };
            });

            return fastdom.write(function () {
                $ad.css('height', closedHeight);
                $('.ad-exp-collapse__slide', $fabricExpandableVideo).css('height', closedHeight);
                if (params.trackingPixel) {
                    addTrackingPixel($adSlot, params.trackingPixel + params.cacheBuster);
                }
                $fabricExpandableVideo.appendTo($adSlot);
                $adSlot.addClass('ad-slot--fabric');
                if( $adSlot.parent().hasClass('top-banner-ad-container') ) {
                    $adSlot.parent().addClass('top-banner-ad-container--fabric');
                }
                return true;
            });
        }
    }
});
