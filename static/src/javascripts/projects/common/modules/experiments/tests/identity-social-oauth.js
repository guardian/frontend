define([
    'common/utils/$',
    'common/utils/config'
], function (
    $,
    config
) {
    return function () {
        this.id = 'IdSocialOauth';
        this.start = '2015-04-22';
        this.expiry = '2015-05-06';
        this.author = 'Marc Hibbins';
        this.description = 'Directs social sign-in attempts to the Identity OAuth app, rather than the Webapp.';
        this.audience = 1.0;
        this.audienceOffset = 0;
        this.successMeasure = 'Users authenticated with OAuth';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Retire the old Webapp!';

        this.canRun = function () {
            return config.page.section === 'identity' && (config.page.pageId === '/signin' || config.page.pageId === '/register');
        };

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'oauth',
                test: function () {
                    $('.social-signin__action').each(function (el) {
                        el.href = el.href.replace(config.page.idWebAppUrl, config.page.idOAuthUrl);
                    });
                    config.page.idWebAppUrl = config.page.idOAuthUrl;
                }
            }
        ];
    };

});
