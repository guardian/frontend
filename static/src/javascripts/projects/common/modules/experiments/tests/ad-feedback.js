define([
    'common/utils/config',
    'common/utils/cookies'
], function (
    config,
    cookies
) {

    return function () {
        this.id = 'AbAdFeedback';
        this.start = '2016-07-21';
        this.expiry = '2016-08-25';
        this.author = 'Justin Pinner';
        this.description = 'Learn which ads attract user feedback.';
        this.audience = 0.02;
        this.audienceOffset = 0;
        this.audienceCriteria = 'Ad-seeing users';
        this.idealOutcome = 'Learn about poor quality ads so that we can figure out how to make things better.';

        this.canRun = function () {
            return config.switches.abAdFeedback === true;
        };

        this.variants = [{
            id: 'ab-ad-feedback-variant',
            test: function () {
                cookies.add('gu_ad_feedback', 'ad-feedback-variant');
            }
        }, {
            id: 'ab-ad-feedback-control',
            test: function () {
                cookies.add('gu_ad_feedback', 'ad-feedback-control');
            }
        }];

    };

});
