define([
    'common/utils/storage',
    'common/utils/template',
    'common/modules/userPrefs',
    'common/modules/onward/history',
    'common/modules/ui/message'
], function(
    storage,
    template,
    userPrefs,
    History,
    Message
){

    /**
     * Rules:
     *
     * 4 visits within the last month
     * 3 impressions
     * Persist close state
     */

    var IMPRESSION_KEY = 'gu.ads.appOnboardCount',
        DATA = {
            IOS : {
                LOGO: 'http://assets.guim.co.uk/images/apps/ios-logo.png',
                SCREENSHOTS: 'http://assets.guim.co.uk/images/apps/ios-screenshots.png',
                LINK: 'https://itunes.apple.com/gb/app/the-guardian/id409128287?mt=8',
                STORE: 'on the App Store'
            },
            ANDROID: {
                LOGO: 'http://assets.guim.co.uk/images/apps/android-logo.png',
                SCREENSHOTS: 'http://assets.guim.co.uk/images/apps/ios-screenshots.png',
                LINK: 'https://play.google.com/store/apps/details?id=com.guardian',
                STORE: 'in Google Play'
            }
        },
        isIOS = /(iPad|iPhone|iPod touch);.*CPU.*OS 7_\d/i.test(navigator.userAgent),
        isAndroid = /Android/i.test(navigator.userAgent),
        visits = new History().getSize(),
        impressions = (storage.local.get(IMPRESSION_KEY)) ? parseInt(storage.local.get(IMPRESSION_KEY), 10) : 0,
        tmp = '<img src="{{LOGO}}" class="app__logo" alt="Guardian App logo" /><div class="app__cta"><h4 class="app__heading">The Guardian app</h4>' +
            '<p class="app__copy">Instant alerts. Offline reading.<br/>Tailored to you.</p>' +
            '<p class="app__copy"><strong>FREE</strong> – {{STORE}}</p></div><a href="{{LINK}}" class="app__link">View</a>' +
            '<img src="{{SCREENSHOTS}}" class="app__screenshots" alt="screenshots" />';

    function isDevice() {
        return (isIOS || isAndroid);
    }

    function canShow() {
        return (visits > 3 && impressions < 4);
    }

    function showMessage() {
        var platform = (isIOS) ? 'ios' : 'android',
            msg = new Message(platform);

        msg.show(template(tmp, DATA[platform.toUpperCase()]));
        storage.local.set(IMPRESSION_KEY, impressions+1);
    }

    function init() {
        if(isDevice() && canShow()) {
            showMessage();
        }
    }

    return {
        init: init
    };

});