define([
    'common/utils/$',
    'common/utils/config',
    'common/modules/adfree-trash'
], function (
   $,
   config,
   AdfreeTrash
) {
    return function () {

        this.id = 'DisableAdsSurvey';
        this.start = '2015-09-01';
        this.expiry = '2015-10-01';
        this.author = 'Zofia Korcz';
        this.description = 'Survey to test if users will be interested in paying for the Guardian with no ads';
        this.audience = 0.15;
        this.audienceOffset = 0.8;
        this.successMeasure = 'Users will be interested in paying for the non-ads Guardian';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'hide ads hide adslot: {slot size}, survey overlay take part';
        this.idealOutcome = 'Users will be interested in paying a lot for the non-ads Guardian';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    var $container;

                    if (config.page.isFront) {
                        $container = $('.js-container--first');
                    } else if (config.page.contentType === "Article") {
                        $container = $('.fc-container').last();
                    }
                    
                    new AdfreeTrash({
                        $container: $container
                    }).show();
                }
                    //$('.js-container--first').insertAfter('.js-container--first');
            },
            {
                id: 'challenger',
                test: function () {
                    /*TODO variant with just a link*/
                }
            },
            {
                id: 'control',
                test: function () {}
            }
        ];
    };
});

