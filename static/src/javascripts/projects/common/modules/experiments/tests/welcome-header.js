define([
    'common/utils/config',
    'common/modules/ui/welcomeBanner',
    'common/utils/detect',
    'common/utils/cookies'
], function (config, welcomeHeader, detect, cookies) {

    return function () {

        var COOKIE_WELCOME_BANNER = 'GU_WELCOMEBANNER',
            cookieVal = cookies.get(COOKIE_WELCOME_BANNER);

        this.id = 'WelcomeHeader';
        this.start = '2016-05-12';
        this.expiry = '2016-05-13';
        this.author = 'Maria Livia Chiorean';
        this.description = 'Show a welcome header for first time users.';
        this.audience = 1;
        this.audienceOffset = 0;
        this.audienceCriteria = 'All users';
        this.idealOutcome = 'People come back more after the first visit.';

        this.canRun = function () {
            return detect.isBreakpoint({max: 'mobile'}) && !cookieVal;
        };

        this.variants = [{
            id: 'test1',
            test: function () {
                cookies.add(COOKIE_WELCOME_BANNER, 1);
            }
        }, {
            id: 'test2',
            test: function () {
                cookies.add(COOKIE_WELCOME_BANNER, 1);
            }
        }];

    };

});
