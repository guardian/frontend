define([
    'fastdom',
    'common/utils/$',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/load-css-promise',
    'common/modules/user-prefs',
    'common/modules/ui/message',
    'lodash/objects/merge',
    'tpl!common/views/smart-app-banner/smart-app-message.html'
], function (
    fastdom,
    $,
    cookies,
    detect,
    storage,
    loadCssPromise,
    userPrefs,
    Message,
    merge,
    messageTpl
) {
    /**
     * Rules:
     *
     * 4 visits within the last month
     * Less than 4 impressions
     * Persist close state
     */
    var COOKIE_IMPRESSION_KEY = 'GU_SMARTAPPBANNER',
        DATA = {
            IOS: {
                LOGO: 'https://assets.guim.co.uk/images/apps/ios-logo.png',
                SCREENSHOTS: 'https://assets.guim.co.uk/images/apps/ios-screenshots.jpg',
                LINK: 'https://app.adjust.com/w97upi?deep_link=gnmguardian://root?contenttype=front&source=adjust',
                STORE: 'on the App Store'
            },
            ANDROID: {
                LOGO: 'https://assets.guim.co.uk/images/apps/android-logo-2x.png',
                SCREENSHOTS: 'https://assets.guim.co.uk/images/apps/ios-screenshots.jpg',
                LINK: 'https://app.adjust.com/642i3r?deep_link=x-gu://www.theguardian.com/?source=adjust',
                STORE: 'in Google Play'
            }
        },
        cookieVal = cookies.get(COOKIE_IMPRESSION_KEY),
        impressions = cookieVal && !isNaN(cookieVal) ? parseInt(cookieVal, 10) : 0;

    function isDevice() {
        return ((detect.isIOS() || detect.isAndroid()) && !detect.isFireFoxOSApp());
    }

    function canShow() {
        return impressions < 4;
    }

    function showMessage() {
        loadCssPromise.then(function () {
            var platform = (detect.isIOS()) ? 'ios' : 'android',
                msg = new Message(platform);

            msg.show(messageTpl(merge({ TABLET: detect.getBreakpoint() !== 'mobile' }, DATA[platform.toUpperCase()])));

            cookies.add(COOKIE_IMPRESSION_KEY, impressions + 1);

            fastdom.read(function () {
                var $banner = $('.site-message--ios, .site-message--android');
                var bannerHeight = $banner.dim().height;
                if (window.scrollY !== 0) {
                    window.scrollTo(window.scrollX, window.scrollY + bannerHeight);
                }
            });
        });
    }

    function init() {
        if (isDevice() && canShow()) {
            showMessage();
        }
    }

    function isMessageShown() {
        return ($('.site-message--android').css('display') === 'block' || $('.site-message--ios').css('display') === 'block');
    }

    function getMessageHeight() {
        return ($('.site-message--android').dim().height || $('.site-message--ios').dim().height);
    }

    return {
        init: init,
        isMessageShown: isMessageShown,
        getMessageHeight: getMessageHeight
    };
});
