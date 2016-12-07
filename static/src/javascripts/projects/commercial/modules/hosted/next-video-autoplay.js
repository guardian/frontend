define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/modules/analytics/google'
], function (
    bean,
    fastdom,
    $,
    googleAnalytics
) {
    var nextVideoInterval;
    var $hostedNext = $('.js-hosted-next-autoplay');
    var $timer = $('.js-autoplay-timer');
    var nextVideoPage = $timer.length && $timer.data('next-page');

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
            var timeLeft = duration - Math.floor(getCurrentTimeFn());
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

    return {
        canAutoplay: canAutoplay,
        triggerEndSlate: triggerEndSlate,
        triggerAutoplay: triggerAutoplay,
        addCancelListener: addCancelListener
    };
});
