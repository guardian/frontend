define([
    'bean',
    'qwery',
    'lib/config',
    'lib/detect',
    'commercial/modules/user-features'

], function (
    bean,
    qwery,
    config,
    detect,
    userFeatures
) {
    return function () {
        this.id = 'PaidCommentingInternal';
        this.start = '2017-03-02';
        this.expiry = '2017-04-27'; // Thursday 27th April
        this.author = 'Justin Pinner';
        this.description = 'Test effects of paid-only commenting (404 test)';
        this.showForSensitive = true;
        this.audience = 0;  // 0% test for internal assessment
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'Internal (and specific opt-ins) only';
        this.dataLinkNames = '';
        this.idealOutcome = 'A paywall doesn\'t destroy commenting';
        this.hypothesis = 'Our most engaged commenters are prepared to pay for the facility. Trolls are not.';

        this.canRun = function () {
            return !userFeatures.isPayingMember();
        };

        this.completeFunc = function(complete) {
            // fire on paid comment's [buy now -->] button click
            bean.on(qwery('.d-comment-box__payment-cta-button__content')[0], 'click', complete);
        };

        this.variants = [
            {
                id: 'pre',
                test: function () {},
                success: this.completeFunc
            },
            {
                id: 'post',
                test: function () {},
                success: this.completeFunc
            }
        ];
    };
});
