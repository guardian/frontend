define([
    'common/utils/$',
    'common/utils/config',
    'common/modules/adfree-thrasher',
    'common/modules/adfree-survey',
    'common/modules/adfree-thrasher-simple',
    'common/modules/adfree-survey-simple'
], function (
    $,
    config,
    AdfreeThrasher,
    AdfreeSurvey,
    AdfreeThrasherSimple,
    AdfreeSurveySimple
) {
    return function () {

        this.id = 'DisableAdsSurvey';
        this.start = '2015-09-24';
        this.expiry = '2015-10-27';
        this.author = 'Zofia Korcz';
        this.description = 'Survey to test if users will be interested in paying for the Guardian with no ads';
        this.audience = 0.075;
        this.audienceOffset = 0.8;
        this.successMeasure = 'Users will be interested in paying for the non-ads Guardian';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'adfree trash read more, hide ads hide adslot: {slot size}, survey overlay take part, survey overlay hide survey message, adfree survey page take part in survey, adfree survey page read more about the guardian app, adfree survey page read more about the guardian members, adfree survey page register email, adfree trash simple read more, hide ads simple hide adslot: {slot size}, survey overlay simple take part, survey overlay simple hide survey message, adfree survey simple page take part in survey, adfree survey simple page read more about the guardian app, adfree survey simple page register email';
        this.idealOutcome = 'Users will be interested in paying a lot for the non-ads Guardian';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    var $container;

                    //attach hidden survey overlay, it will be triggered by a 'Remove ads' label or thrasher
                    new AdfreeSurvey().attach();

                    if (config.page.isFront) {
                        $container = $('.js-container--first');
                    } else if (config.page.contentType === 'Article') {
                        $container = $('.fc-container').last();
                    }

                    if ($container) {
                        new AdfreeThrasher({
                            $container: $container
                        }).show();
                    }
                }
            },
            {
                id: 'simple',
                test: function () {
                    var $container;

                    //attach hidden survey overlay, it will be triggered by a 'Remove ads' label or thrasher
                    new AdfreeSurveySimple().attach();

                    if (config.page.isFront) {
                        $container = $('.js-container--first');
                    } else if (config.page.contentType === 'Article') {
                        $container = $('.fc-container').last();
                    }

                    if ($container) {
                        new AdfreeThrasherSimple({
                            $container: $container
                        }).show();
                    }
                }
            },
            {
                id: 'control',
                test: function () {}
            }
        ];
    };
});
