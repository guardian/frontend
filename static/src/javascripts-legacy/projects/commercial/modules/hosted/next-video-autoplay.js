define([
    'bean',
    'fastdom',
    'commercial/modules/hosted/next-video',
    'lib/$',
    'common/modules/analytics/google'
], function (
    bean,
    fastdom,
    NextVideo,
    $,
    googleAnalytics
) {
    var nextVideoInterval;
    var $hostedNext;
    var $timer;
    var nextVideoPage;

    function cancelAutoplay() {
        fastdom.write(function () {
            $hostedNext.addClass('hosted-slide-out');
        });
        clearInterval(nextVideoInterval);
    }

    function cancelAutoplayMobile($hostedNext) {
        fastdom.write(function () {
            $hostedNext.addClass('u-h');
        });
    }

    function triggerAutoplay(getCurrentTimeFn, duration) {
        nextVideoInterval = setInterval(function () {
            var timeLeft = duration - Math.ceil(getCurrentTimeFn());
            var countdownLength = 10; //seconds before the end when to show the timer

            if (timeLeft <= countdownLength) {
                fastdom.write(function () {
                    $hostedNext.addClass('js-autoplay-start');
                    $timer.text(timeLeft + 's');
                });
            }
            if (timeLeft <= 0){
                googleAnalytics.trackNonClickInteraction('Immediately play the next video');
                window.location = nextVideoPage;
            }
        }, 1000);
    }

    function triggerEndSlate() {
        fastdom.write(function () {
            $hostedNext.addClass('js-autoplay-start');
        });
        bean.on(document, 'click', $('.js-autoplay-cancel'), function () {
            cancelAutoplayMobile($hostedNext);
        });
    }

    function addCancelListener() {
        bean.on(document, 'click', $('.js-autoplay-cancel'), function () {
            cancelAutoplay();
        });
    }

    function canAutoplay() {
        return $hostedNext.length && nextVideoPage;
    }

    function init() {
        return NextVideo.load().then(function() {
            $hostedNext = $('.js-hosted-next-autoplay');
            $timer = $('.js-autoplay-timer');
            nextVideoPage = $timer.length && $timer.data('next-page');
        });
    }

    return {
        init: init,
        canAutoplay: canAutoplay,
        triggerEndSlate: triggerEndSlate,
        triggerAutoplay: triggerAutoplay,
        addCancelListener: addCancelListener
    };
});
