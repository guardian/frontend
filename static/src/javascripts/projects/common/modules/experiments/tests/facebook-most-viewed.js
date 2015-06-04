define([
    'qwery',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/onward/facebook-most-popular'
], function (
    qwery,
    config,
    detect,
    FacebookMostPopular
) {
    return function () {
        this.id = 'FacebookMostViewed';
        this.start = '2015-06-04';
        this.expiry = '2015-08-01';
        this.author = 'Robert Berry';
        this.description = 'Facebook most viewed container';
        this.audience = 0.1;
        this.audienceOffset = 0.25;
        this.successMeasure = 'More page views per visit';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return detect.socialContext() === 'facebook';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'variant',
                test: function () {
                    var el = qwery('.js-facebook-most-popular');

                    if (el) {
                        new FacebookMostPopular(el);
                    }
                }
            }
        ];
    };
});