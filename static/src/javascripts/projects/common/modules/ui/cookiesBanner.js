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
    var COOKIE_ACKNOWLEDGE_KEY = 'GU_EU_COOKIE_ACK',
        cookieVal = cookies.get(COOKIE_ACKNOWLEDGE_KEY),
        impressions = cookieVal && !isNaN(cookieVal) ? parseInt(cookieVal, 10) : 0,
        link = 'https://www.theguardian.com/info/cookies',
        txt = '<p class="cookie-message__copy">Welcome to the Guardian. This site uses cookies, read our policy <a href="' + link + '" class="cookie-message__link">here</a>.</p>',
        opts = {important: true},
        cookieLifeDays = 365,
        msg = new Message('cookies');

    function canShow() {
        return config.isEu && impressions == 0;
    }

    function showMessage() {
        msg.acknowledge = function() {
            cookies.add(COOKIE_ACKNOWLEDGE_KEY, impressions + 1, cookieLifeDays);
            msg.hide();
        };
        msg.show(txt, opts);
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
