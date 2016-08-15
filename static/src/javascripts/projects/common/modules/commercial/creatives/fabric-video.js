define([
    'qwery',
    'bonzo',
    'common/utils/fastdom-promise',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'text!common/views/commercial/creatives/fabric-video.html'
], function (qwery, bonzo, fastdom, detect, template, addTrackingPixel, fabricVideoStr) {
    var fabricVideoTpl;

    return FabricVideo;

    function FabricVideo(adSlot, params) {
        var isUpdating = false;
        var isMobile = detect.isBreakpoint({ max: 'phablet' });
        var hasVideo, video, layer2, inView;

        adSlot = adSlot instanceof HTMLElement ? adSlot : adSlot[0];
        fabricVideoTpl || (fabricVideoTpl = template(fabricVideoStr));

        hasVideo = !(detect.isIOS() || detect.isAndroid() || isMobile);

        if (isMobile) {
            params.posterMobile = '<div class="creative__poster" style="background-image:url(' + params.VideoBackupImage + ')"></div>';
        } else {
            if (hasVideo) {
                params.video = '<video muted class="creative__video creative__video--' + params.Videoalignment + '"><source src="' + params.VideoURL + '" type="video/mp4"></video>';
            } else {
                params.posterTablet = '<div class="creative__poster" style="background-image:url(' + params.VideoBackupImage + ')"></div>';
            }
        }

        return Object.freeze({
            create: create
        });

        function create() {
            return fastdom.write(function () {
                if (params.Trackingpixel) {
                    addTrackingPixel(bonzo(adSlot), params.Trackingpixel + params.cacheBuster);
                }
                adSlot.insertAdjacentHTML('beforeend', fabricVideoTpl({ data: params }));
            }).then(function () {
                layer2 = qwery('.creative__layer2', adSlot);

                window.addEventListener('scroll', onScroll);
                adSlot.addEventListener('animationend', function () {
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
