define([
    'common/utils/config',
    'common/utils/$',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/user-prefs',
    'common/modules/ui/message'
], function (
    config,
    $,
    cookies,
    detect,
    storage,
    template,
    userPrefs,
    Message
) {
    /**
     * Rules:
     *
     * EU visitors only
     * Never seen the cookie message before
     * Show once only
     * Show only on FIRST page view
     * Persist close state
     */
    var COOKIE_MESSAGE_KEY = 'GU_EU_COOKIES',
        impressions = 0;

    function canShow() {
        if (config.isEu) {
            var cookieVal = cookies.get(COOKIE_MESSAGE_KEY);
            impressions = cookieVal && !isNaN(cookieVal) ? parseInt(cookieVal, 10) : 0;
            return impressions == 0;
        } else {
            return false;
        }
    }

    function showMessage() {
        var link = 'https://www.theguardian.com/info/cookies',
            txt = 'Welcome to the Guardian. This site uses cookies, read our policy <a href="' + link + '" class="cookie-message__link">here</a>.',
            opts = {important: true},
            cookieLifeDays = 365,
            msg = new Message('cookies');
        msg.show(txt, opts);
        cookies.add(COOKIE_MESSAGE_KEY, impressions + 1, cookieLifeDays);
    }

    function init() {
        if (canShow()) {
            showMessage();
        }
    }

    return {
        init: init
    };

});
