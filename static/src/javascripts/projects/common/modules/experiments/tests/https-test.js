define([
    'common/utils/cookies'
], function (
    cookies
) {
    return function () {
        this.id = 'https-test';
        this.start = '2016-04-28';
        this.expiry = '2016-05-26';
        this.author = 'Justin Pinner';
        this.description = 'Test how users get on with https site-wide (0% initially)';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Pages are served over https';
        this.audienceCriteria = 'Small percentage of users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Nobody reports that things are broken';
        this.hypothesis = 'We believe that most of our content should serve successfully over https, with a few known exceptions.';

        this.canRun = function () {
            return !cookies.get('https_opt_in');
        };

        this.variants = [
            {
                id: 'mvt-https',
                test: function () {
                    if(document.location.href.startsWith('http:')) {
                        document.cookie = 'https_opt_in=true; expires=Thu, 26 May 2016 22:59:59 GMT';
                        document.location = document.location.href.replace('http:','https:');
                    }
                }
            }
        ];
    };
});
