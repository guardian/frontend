define([
    'common/utils/$',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/user-prefs',
    'common/modules/ui/message'
], function (
    $,
    cookies,
    detect,
    storage,
    template,
    userPrefs,
    Message
){
    /**
     * Rules:
     *
     * EU visitors only
     * Never seen the cookie message before
     * Show once only
     * Show only on FIRST page view
     * Persist close state
     */
    var COOKIE_IMPRESSION_KEY = 'GU_EU_COOKIEBANNER',
        cookieVal = cookies.get(COOKIE_IMPRESSION_KEY),
        impressions = cookieVal && !isNaN(cookieVal) ? parseInt(cookieVal, 10) : 0,
        link='https://www.theguardian.com/info/cookies',
        txt = '<p class="cookie-message__copy">Welcome to the Guardian. This site uses cookies, read our policy <a href="<%=link%>" class="cookie-message__link">here</a>.</p>',
        opts = {important: true};

    function canShow() {
        return document.hasOwnProperty("eu-cookie-message") && impressions == 0;
    }

    function showMessage() {
        var msg = new Message("cookies");
        msg.show(txt, opts);
        cookies.add(COOKIE_IMPRESSION_KEY, impressions + 1);
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
