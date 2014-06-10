define([
    'common/$',
    'common/modules/onward/most-popular-factory',
    'common/modules/onward/history',
],function(
    $,
    Factory,
    History
 ){

    return function() {

        this.id = 'DisplaySociallyReferredBurners';
        this.start = '2014-06-08';
        this.expiry = '2014-06-24';
        this.author = 'Nathaniel Bennett';
        this.description = 'Will display content referred from social media to users who have visited less than 10 times in the previous month';
        this.audience = 0.4;
        this.audienceOffset = 0.6;
        this.successMeasure = 'Success';
        this.audienceCriteria = 'Audience ';
        this.dataLinkNames = 'Data link names';
        this.idealOutcome = 'Outcome';




        this.canRun = function () { return true; };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    console.log('++ Control');
                }
            },
            {
                id: 'display-referred-content',
                test: function () {
                    var date = new Date();
                    date.setMonth(date.getMonth()-1)
                    var sessionsThisMonth = new History().numberOfSessionsSince(date);
                    if ( sessionsThisMonth < 10) {
                        $('.js-popular').remove()
                        Factory.setShowReferred();
                    }
                }
            }
        ];
    };

});
