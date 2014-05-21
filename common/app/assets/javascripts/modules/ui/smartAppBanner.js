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
                LINK: 'http://www.apple.com'
            },
            ANDROID: {
                LOGO: 'http://assets.guim.co.uk/images/apps/android-logo.png',
                LINK: 'http://www.google.com'
            }
        },
        isAndroid = false,
        isIOS = false,
        tmp = '<img src="{{logo}}" class="app__logo" /><div class="app__cta"><h4 class="app__heading">The Guardian app</h4>' +
            '<p class="app__copy">Instant alerts. Offline reading.<br/>Tailored to you.</p>' +
            '<p class="app__copy"><strong>FREE</strong> – on the App Store</p></div><a href="{{link}}" class="app__link">View</a>';

    function isDevice() {
        isIOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
        isAndroid = /Android/i.test(navigator.userAgent);
        //return (isIOS || isAndroid);
        return true;
    }

    function canShow() {
        var visits = new History().getSize(),
            impressions = storage.local.get(IMPRESSION_KEY) || 1;

        return (visits > 3 && impressions < 4);
    }

    function showMessage() {
        var platform = (isIOS) ? 'ios' : 'android',
            msg = new Message(platform);

        msg.show(template(tmp, {
            logo: DATA[platform.toUpperCase()].LOGO,
            link: DATA[platform.toUpperCase()].LINK
        }));
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