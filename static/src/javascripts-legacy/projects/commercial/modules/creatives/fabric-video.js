define([
    'qwery',
    'lib/events',
    'lib/fastdom-promise',
    'lib/detect',
    'lodash/utilities/template',
    'commercial/modules/creatives/add-tracking-pixel',
    'commercial/modules/creatives/add-viewability-tracker',
    'raw-loader!commercial/views/creatives/fabric-video.html'
], function (qwery, events, fastdom, detect, template, addTrackingPixel, addViewabilityTracker, fabricVideoStr) {
    var fabricVideoTpl;

    return FabricVideo;

    function FabricVideo(adSlot, params) {
        var isUpdating = false;
        var isSmallScreen = detect.isBreakpoint({ max: 'phablet' });
        var hasVideo, video, layer2, inView;

        fabricVideoTpl || (fabricVideoTpl = template(fabricVideoStr));

        hasVideo = !(detect.isIOS() || detect.isAndroid() || isSmallScreen);

        params.id = 'fabric-video-' + (Math.random() * 10000 | 0).toString(16);

        if (isSmallScreen) {
            params.posterMobile = '<div class="creative__poster" style="background-image:url(' + params.Videobackupimage + ')"></div>';
        } else {
            if (hasVideo) {
                params.video = '<video muted class="creative__video creative__video--' + params.Videoalignment + '"><source src="' + params.VideoURL + '" type="video/mp4"></video>';
            }

            params.posterTablet = '<div class="creative__poster" style="background-image:url(' + params.BackgroundImagemobile + ')"></div>';
        }

        return Object.freeze({
            create: create
        });

        function create() {
            return fastdom.write(function () {
                if (params.Trackingpixel) {
                    addTrackingPixel.addTrackingPixel(params.Trackingpixel + params.cacheBuster);
                }
                if (params.Researchpixel) {
                    addTrackingPixel.addTrackingPixel(params.Researchpixel + params.cacheBuster)
                }
                adSlot.insertAdjacentHTML('beforeend', fabricVideoTpl({ data: params }));
                if (params.viewabilityTracker) {
                    addViewabilityTracker(adSlot, params.id, params.viewabilityTracker);
                }
                adSlot.classList.add('ad-slot--fabric');
                if( adSlot.parentNode.classList.contains('top-banner-ad-container') ) {
                    adSlot.parentNode.classList.add('top-banner-ad-container--fabric');
                }
            }).then(function () {
                layer2 = qwery('.creative__layer2', adSlot);

                events.addEventListener(window, 'scroll', onScroll, { passive: true });
                events.addEventListener(adSlot, 'animationend', function () {
                    window.removeEventListener('scroll', onScroll);
                });

                if (hasVideo) {
                    video = adSlot.getElementsByTagName('video')[0];
                    video.onended = onVideoEnded;
                }

                fastdom.read(onScroll);

                return true;
            });
        }

        function onVideoEnded() {
            video.onended = null;
            video = null;
        }

        function onScroll() {
            var viewportHeight = detect.getViewport().height;
            var rect = adSlot.getBoundingClientRect();
            inView = rect.top >= 0 && rect.bottom < viewportHeight;
            if (!isUpdating) {
                isUpdating = true;
                fastdom.write(updateView);
            }
        }

        function updateView() {
            isUpdating = false;
            if (video) {
                updateVideo();
            }
            updateAnimation();
        }

        function updateVideo() {
            if (inView) {
                video.play();
            } else {
                video.pause();
            }
        }

        function updateAnimation() {
            if (inView) {
                playAnimation();
            } else {
                pauseAnimation();
            }
        }

        function playAnimation() {
            layer2.forEach(function (l) { l.classList.add('is-animating'); });
        }

        function pauseAnimation() {
            layer2.forEach(function (l) { l.classList.remove('is-animating'); });
        }

    }
});
