define([
    'common/utils/config'
], function (
    config
) {

    return function () {
        this.id = 'AdFeedback';
        this.start = '2016-07-21';
        this.expiry = '2016-08-25';
        this.author = 'Justin Pinner';
        this.description = 'Learn which ads attract user feedback.';
        this.audience = 0.02;
        this.audienceOffset = 0;
        this.audienceCriteria = 'Ad-seeing users';
        this.idealOutcome = 'Learn about the quality of ads so that we can figure out how to make things better.';

        this.canRun = function () {
            return config.switches.abAdFeedback === true;
        };

        this.variants = [{
            id: 'ad-feedback-variant',
            test: function () {}
        }, {
            id: 'ad-feedback-control',
            test: function () {}
        }];

    };

});
