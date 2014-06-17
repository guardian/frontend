define([
    'common/utils/config'
],function(
    config
    ){

    return function() {

        this.id = 'Sentry';
        this.start = '2014-06-17';
        this.expiry = '2014-06-27';
        this.author = 'Patrick Hamann';
        this.description = 'Beacons user JavaScript errors to the Sentry server.';
        this.audience = 0.2;
        this.audienceOffset = 0.5;
        this.successMeasure = 'Developer and business confidence.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'n/a';
        this.idealOutcome = 'Increased visualisation of the state of our JavaScript errors';

        this.canRun = function () { return true; };

        this.variants = [
            {
                id: 'errors',
                test: function () {
                    console.log('inside test');
                    require('raven', function(raven) {
                        raven.config('http://' + config.page.sentryApiKey + '@' + config.page.sentryHost, {
                            logger: 'javascript',
                            whitelistUrls: [
                                /localhost/,
                                /assets\.guim\.co\.uk/,
                                /theguardian\.com/,
                                /ophan\.co\.uk/,
                                /api\.nextgen\.guardianapps\.co\.uk/
                            ],
                            tags: {
                                edition: config.page.edition,
                                contentType: config.page.contentType,
                                buildNumber: config.page.buildNumber
                            }
                        }).install();

                        throw new Error('testing sentry');
                    });
                }
            }
        ];
    };

});
