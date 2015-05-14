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
    Identity
) {

    return function () {
        this.id = 'IdentityCookieRefresh';
        this.start = '2015-05-14';
        this.expiry = '2015-06-14';
        this.author = 'Mark Butler';
        this.description = 'Measured roll out of Identity session refresh';
        this.audience = 0.01;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = '1% of users.';
        this.dataLinkNames = '';
        this.idealOutcome = '1% of users have their session extended if their session is over one month old.';
        this.showForSensitive = false;

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    var identity = new Identity();
                    identity.refreshCookie();
                }
            }
        ];
    };
});
