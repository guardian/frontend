define([
    'bean',
    'lib/fastdom-promise',
    'lib/$',
    'lodash/objects/assign',
    'lodash/utilities/template',
    'raw-loader!commercial/views/creatives/fabric-expandable-video-v2.html',
    'raw-loader!commercial/views/creatives/fabric-expandable-video-v2-cta.html',
    'svgs/icon/arrow-down.svg',
    'svgs/icon/close-central.svg',
    'commercial/modules/creatives/add-tracking-pixel',
    'commercial/modules/creatives/add-viewability-tracker'
], function (
    bean,
    fastdom,
    $,
    assign,
    template,
    fabricExpandableVideoHtml,
    fabricExpandableCtaHtml,
    arrowDown,
    closeCentral,
    addTrackingPixel,
    addViewabilityTracker
) {
    return FabricExpandableVideoV2;

    function FabricExpandableVideoV2(adSlot, params) {
        var isClosed     = true;
        var closedHeight = 250;
        var openedHeight = 500;

        var ctaTpl = template(fabricExpandableCtaHtml);

        return Object.freeze({ create: create });

        function create() {
            var videoHeight = openedHeight;
            var plusIconPosition = params.showCrossInContainer.substring(3);
            var additionalParams = {
                id: 'fabric-expandable-' + (Math.random() * 10000 | 0).toString(16),
                desktopCTA: params.ctaDesktopImage ? ctaTpl({ media: 'hide-until-tablet', link: params.link, image: params.ctaDesktopImage, position: params.ctaDesktopPosition }): '',
                mobileCTA: params.ctaMobileImage ? ctaTpl({ media: 'mobile-only', link: params.link, image: params.ctaMobileImage, position: params.ctaMobilePosition }): '',
                showArrow: (params.showMoreType === 'arrow-only' || params.showMoreType === 'plus-and-arrow') ?
                    '<button class="ad-exp__open-chevron ad-exp__open">' + arrowDown.markup + '</button>'
                    : '',
                showPlus: params.showMoreType === 'plus-only' || params.showMoreType === 'plus-and-arrow' ?
                    '<button class="ad-exp__close-button ad-exp__open ad-exp__open--' + plusIconPosition + '">' + closeCentral.markup + '</button>'
                    : '',
                videoEmbed: (params.YoutubeVideoURL !== '') ?
                    '<iframe id="YTPlayer" width="100%" height="' + videoHeight + '" src="' + params.YoutubeVideoURL + '?showinfo=0&amp;rel=0&amp;controls=0&amp;fs=0&amp;title=0&amp;byline=0&amp;portrait=0" frameborder="0" class="expandable-video"></iframe>'
                    : ''
            };
            var $fabricExpandableVideo = $.create(template(fabricExpandableVideoHtml, { data: assign(params, additionalParams) }));
            var $ad = $('.ad-exp--expand', $fabricExpandableVideo);

            bean.on(adSlot, 'click', '.ad-exp__open', function () {
                fastdom.write(function () { open(isClosed); });
            });

            bean.on(adSlot, 'click', '.video-container__cta, .creative__cta', function () {
                fastdom.write(function () { open(false); });
            });

            return fastdom.write(function () {
                $ad.css('height', closedHeight);
                $('.ad-exp-collapse__slide', $fabricExpandableVideo).css('height', closedHeight);
                if (params.trackingPixel) {
                    addTrackingPixel(params.trackingPixel + params.cacheBuster);
                }
                if (params.researchPixel) {
                    addTrackingPixel(params.researchPixel + params.cacheBuster);
                }
                $fabricExpandableVideo.appendTo(adSlot);
                if (params.viewabilityTracker) {
                    addViewabilityTracker(adSlot, params.id, params.viewabilityTracker);
                }
                adSlot.classList.add('ad-slot--fabric');
                if( adSlot.parentNode.classList.contains('top-banner-ad-container') ) {
                    adSlot.parentNode.classList.add('top-banner-ad-container--fabric');
                }
                return true;
            });

            function open(open) {
                var videoSrc = $('#YTPlayer').attr('src');
                var videoSrcAutoplay = videoSrc;

                if (videoSrc.indexOf('autoplay') === -1) {
                    videoSrcAutoplay = videoSrc + '&amp;autoplay=1';
                } else {
                    videoSrcAutoplay = videoSrcAutoplay.replace(
                        open ? 'autoplay=0' : 'autoplay=1',
                        open ? 'autoplay=1' : 'autoplay=0'
                    );
                }

                if (open) {
                    $('.ad-exp__close-button', adSlot).addClass('button-spin');
                    $('.ad-exp__open-chevron', adSlot).addClass('chevron-down');
                    $ad.css('height', openedHeight);
                    $fabricExpandableVideo.addClass('creative--open');
                    $('.slide-video, .slide-video .ad-exp__layer', adSlot)
                    .css('height', openedHeight)
                    .addClass('slide-video__expand');
                } else {
                    $('.ad-exp__close-button', adSlot).removeClass('button-spin');
                    $('.ad-exp__open-chevron', adSlot).removeClass('chevron-down');
                    $ad.css('height', closedHeight);
                    $fabricExpandableVideo.removeClass('creative--open');
                    $('.slide-video, .slide-video .ad-exp__layer', adSlot)
                    .css('height', closedHeight)
                    .removeClass('slide-video__expand');
                }

                isClosed = !open;

                setTimeout(function () {
                    $('#YTPlayer').attr('src', videoSrcAutoplay);
                }, 1000);
            }
        }
    }
});
