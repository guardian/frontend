define([
    'bonzo',
    'qwery',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/identity/api'
], function (
    bonzo,
    qwery,
    detect,
    config,
    mediator,
    template,
    Id
) {

    return function () {
        this.id = 'CookieRefresh';
        this.start = '2015-05-14';
        this.expiry = '2015-06-14';
        this.author = 'Mark Butler';
        this.description = 'Measured roll out of Identity session refresh';
        this.audience = 0.01;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = '1% of users.';
        this.dataLinkNames = '';
        this.idealOutcome = '1% of users have their signed in session extended. If they are signed-in and their session is over one month old.';
        this.showForSensitive = true;

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'refresh',
                test: function () {
                    Id.init();
                    Id.refreshCookie();
                }
            }
        ];
    };
});
