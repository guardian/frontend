define([
    'common/utils/config'
], function (config) {

    return function () {
        this.id = 'RelatedContentDisplayAsRecommendation';
        this.start = '2016-03-07';
        this.expiry = '2016-03-16';
        this.author = 'Mariot Chauvin';
        this.description = 'Display related content as people who read this also read';
        this.audience = .35;
        this.audienceOffset = .3;
        this.successMeasure = 'Component clicks per article view, attention time following the click through, page views per visit, articles per visit, Minutes spent reading articles per visit, and visits within last 7 days.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'not any change as this is measure our baseline';

        this.canRun = function () {
            var ct = config.page.contentType;
            return ct === 'Article';
        };

        this.variants = [{
            id: 'control',
            test: function () {}
        }, {
            id: 'people-who-read-this-also-read-title',
            test: function () {}
        }];

    };

});
