define([
    'common/utils/$',
    'common/utils/config',
    'common/modules/onward/most-popular-factory',
    'common/modules/onward/history'
],function(
    $,
    config,
    Factory,
    History
 ){

    return function() {

        this.id = 'DisplaySociallyReferredBurners';
        this.start = '2014-06-11';
        this.expiry = '2014-06-26';
        this.author = 'Nathaniel Bennett';
        this.description = 'Will display content referred from social media to users who have visited less than 10 times in the previous month';
        this.audience = 0.4;
        this.audienceOffset = 0.6;
        this.successMeasure = 'Increased CTR on component';
        this.audienceCriteria = 'Social media to referrers on article pages ';
        this.dataLinkNames = 'referred-content';
        this.idealOutcome = 'Higher click-through rate on most popular component for users in the test variant.';

        this.canRun = function () { return config.page.contentType === 'Article'; };

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'display-referred-content',
                test: function () {
                    var date = new Date();
                    date.setMonth(date.getMonth()-1);
                    var sessionsThisMonth = new History().numberOfSessionsSince(date);

                    if (sessionsThisMonth < 10) {
                        $('.js-popular').remove();
                        Factory.setShowReferred();
                    }
                }
            }
        ];
    };

});
