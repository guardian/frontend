define(
    [
        'lib/config',
        'lib/$',
        'lib/cookies',
        'lib/detect',
        'lib/storage',
        'lodash/utilities/template',
        'common/modules/user-prefs',
        'common/modules/ui/message',
        'lib/mediator',
    ],
    function(
        config,
        $,
        cookies,
        detect,
        storage,
        template,
        userPrefs,
        Message,
        mediator
    ) {
        /**
     * Rules:
     *
     * UK / INT edition readers only
     * Never seen the cookie message before
     * Show once only
     * Show only on FIRST page view
     * Persist close state
     */
        function init() {
            var geoContinentCookie = cookies.getCookie('GU_geo_continent');
            if (
                geoContinentCookie &&
                geoContinentCookie.toUpperCase() === 'EU'
            ) {
                var EU_COOKIE_MSG = 'GU_EU_MSG',
                    euMessageCookie = cookies.getCookie(EU_COOKIE_MSG);
                if (!euMessageCookie || euMessageCookie != 'seen') {
                    var link = 'https://www.theguardian.com/info/cookies',
                        txt =
                            'Welcome to the Guardian. This site uses cookies. Read <a href="' +
                            link +
                            '" class="cookie-message__link">our policy</a>.',
                        opts = { important: true },
                        cookieLifeDays = 365,
                        msg = new Message('cookies', opts);
                    msg.show(txt);
                    cookies.addCookie(EU_COOKIE_MSG, 'seen', cookieLifeDays);
                    return true;
                }
            }
            mediator.emit('modules:ui:cookiesBanner:notShown');
        }

        return {
            init: init,
        };
    }
);
