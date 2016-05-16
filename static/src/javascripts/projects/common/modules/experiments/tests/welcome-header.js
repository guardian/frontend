define([
    'common/utils/config',
    'common/modules/ui/welcome-banner',
    'common/utils/detect',
    'common/utils/cookies',
    'common/utils/storage'
], function (
    config,
    welcomeHeader,
    detect,
    cookies,
    storage
) {
    return function () {
        var COOKIE_WELCOME_BANNER = 'GU_WELCOMEBANNER',
            cookieVal = cookies.get(COOKIE_WELCOME_BANNER);

        this.id = 'WelcomeHeader';
        this.start = '2016-05-12';
        this.expiry = '2016-05-18';
        this.author = 'Maria Livia Chiorean';
        this.description = 'Show a welcome header for first time users.';
        this.audience = 0;
        this.audienceOffset = 0;
        this.audienceCriteria = 'First time users';
        this.idealOutcome = 'People come back more after the first visit.';

        this.canRun = function () {
            var firstTimeVisitor = false;
            if (!cookieVal && storage.local.isStorageAvailable()) {
                var alreadyVisited = storage.local.get('gu.alreadyVisited');
                if (!alreadyVisited || alreadyVisited == 1) {
                    firstTimeVisitor = true;
                    cookies.add(COOKIE_WELCOME_BANNER, 1);
                }
            }
            return detect.isBreakpoint({max: 'mobile'}) && firstTimeVisitor;
        };

        this.variants = [{
            id: 'control',
            test: function () {

            }
        }, {
            id: 'liberal-newspaper',
            test: function () {
                console.log("liberal-newspaper");
                welcomeHeader.showWelcomeMessage(this.id);
            }
        }, {
            id: 'award-winning',
            test: function () {
                console.log("award-winning");
                welcomeHeader.showWelcomeMessage(this.id);
            }
        }, {
            id: 'since-1821',
            test: function () {
                console.log("since-1821");
                welcomeHeader.showWelcomeMessage(this.id);
            }
        }];

    };

});
