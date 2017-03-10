define([
    'bean',
    'qwery',
    'common/utils/config',
    'common/utils/detect',
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
        this.expiry = '2017-03-30'; // Thursday 30th March
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
            bean.on(qwery('.paid-comment-intercept .link-button')[0], 'click', complete);
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
