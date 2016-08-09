define([
    'bean',
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'text!common/views/experiments/recommended-for-you.html'
], function (
    bean,
    fastdom,
    qwery,
    $,
    config,
    template,
    recommendedForYouTemplate
) {
    return function () {
        this.id = 'RecommendedForYou';
        this.start = '2016-08-02';
        this.expiry = '2016-09-24';
        this.author = 'Joseph Smith';
        this.description = 'Add a personalised container to fronts';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Number of clicks to turn on this section';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'People will click to turn on this section';

        var $opinionSection;

        this.canRun = function () {
            $opinionSection = $('#opinion');
            return config.page.isFront && $opinionSection.length;
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    var $recommendedForYouSection = $.create(template(recommendedForYouTemplate, {}));

                    return fastdom.write(function() {
                        $recommendedForYouSection.insertBefore($opinionSection);
                    });
                },
                success: function (complete) {
                }
            }
        ];
    };
});
