define([
    'common/utils/config'
], function (config) {

    return function () {
        this.id = 'PeopleWhoReadThisAlsoReadVariants';
        this.start = '2016-03-21';
        this.expiry = '2016-03-31';
        this.author = 'Luke Taylor';
        this.description = 'Display people who read this also read with different variants.';
        this.audience = .35;
        this.audienceOffset = .3;
        this.successMeasure = 'Component clicks per article view, attention time following the click through, page views per visit, articles per visit, Minutes spent reading articles per visit, and visits within last 7 days.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'an increase in attention time following the click through, page views per visit, articles per visit, Minutes spent reading articles per visit, and visits within last 7 days.';

        this.canRun = function () {
            var ct = config.page.contentType;
            return ct === 'Article';
        };

        this.variants = [{
            id: 'control',
            test: function () {}
        }, {
            id: 'people-who-read-this-also-read-thirty-minutes',
            test: function () {}
        }, {
            id: 'people-who-read-this-also-read-three-hours',
            test: function () {}
        }, {
            id: 'people-who-read-this-also-read-twenty-four-hours',
            test: function () {}
        }];

    };

});
