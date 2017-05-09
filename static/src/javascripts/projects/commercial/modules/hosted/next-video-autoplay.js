import bean from 'bean';
import fastdom from 'fastdom';
import NextVideo from 'commercial/modules/hosted/next-video';
import $ from 'lib/$';
import googleAnalytics from 'common/modules/analytics/google';
let nextVideoInterval;
let $hostedNext;
let $timer;
let nextVideoPage;

function cancelAutoplay() {
    fastdom.write(() => {
        $hostedNext.addClass('hosted-slide-out');
    });
    clearInterval(nextVideoInterval);
}

function cancelAutoplayMobile($hostedNext) {
    fastdom.write(() => {
        $hostedNext.addClass('u-h');
    });
}

function triggerAutoplay(getCurrentTimeFn, duration) {
    nextVideoInterval = setInterval(() => {
        const timeLeft = duration - Math.ceil(getCurrentTimeFn());
        const countdownLength = 10; //seconds before the end when to show the timer

        if (timeLeft <= countdownLength) {
            fastdom.write(() => {
                $hostedNext.addClass('js-autoplay-start');
                $timer.text(timeLeft + 's');
            });
        }
        if (timeLeft <= 0) {
            googleAnalytics.trackNonClickInteraction('Immediately play the next video');
            window.location = nextVideoPage;
        }
    }, 1000);
}

function triggerEndSlate() {
    fastdom.write(() => {
        $hostedNext.addClass('js-autoplay-start');
    });
    bean.on(document, 'click', $('.js-autoplay-cancel'), () => {
        cancelAutoplayMobile($hostedNext);
    });
}

function addCancelListener() {
    bean.on(document, 'click', $('.js-autoplay-cancel'), () => {
        cancelAutoplay();
    });
}

function canAutoplay() {
    return $hostedNext.length && nextVideoPage;
}

function init() {
    return NextVideo.load().then(() => {
        $hostedNext = $('.js-hosted-next-autoplay');
        $timer = $('.js-autoplay-timer');
        nextVideoPage = $timer.length && $timer.data('next-page');
    });
}

export default {
    init,
    canAutoplay,
    triggerEndSlate,
    triggerAutoplay,
    addCancelListener
};
