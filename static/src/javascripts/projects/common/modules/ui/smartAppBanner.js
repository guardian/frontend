define([
    'common/utils/$',
    'common/utils/cookies',
    'common/utils/detect',
    'common/modules/ui/message'
], function (
    $,
    cookies,
    detect,
    Message
) {
    /**
     * Rules:
     *
     * 4 visits within the last month
     * 3 impressions
     * Persist close state
     */
    var COOKIE_IMPRESSION_KEY = 'GU_SMARTAPPBANNER',
        cookieVal = cookies.get(COOKIE_IMPRESSION_KEY),
        impressions = cookieVal && !isNaN(cookieVal) ? parseInt(cookieVal, 10) : 0,
        message = '<img src="http://assets.guim.co.uk/images/apps/android-logo-2x.png" class="app__logo" alt="Guardian App logo" />' +
            '<div class="app__cta">' +
            '<h4 class="app__heading">The Guardian app</h4>' +
            '<p class="app__copy">Instant alerts. Offline reading.<br/>Tailored to you.</p>' +
            '<p class="app__copy"><strong>FREE</strong> – in Google Play</p>' +
            '</div>' +
            '<a href="https://app.adjust.com/642i3r?deep_link=x-gu://www.theguardian.com/?source=adjust" class="app__link">View</a>';

    function isDevice() {
        return ((detect.isAndroid()) && !detect.isFireFoxOSApp());
    }

    function canShow() {
        return impressions < 4;
    }

    function showMessage() {
        var msg = new Message('android');

        msg.show(message);
        cookies.add(COOKIE_IMPRESSION_KEY, impressions + 1);
    }

    function init() {
        if (isDevice() && canShow()) {
            showMessage();
        }
    }

    function isMessageShown() {
        return $('.site-message--android').css('display') === 'block';
    }

    function getMessageHeight() {
        return $('.site-message--android').dim().height;
    }

    return {
        init: init,
        isMessageShown: isMessageShown,
        getMessageHeight: getMessageHeight
    };
});
