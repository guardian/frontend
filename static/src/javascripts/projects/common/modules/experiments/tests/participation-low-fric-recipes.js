define([
    'common/utils/config',
    'common/utils/mediator',
    'Promise'
], function (
    config,
    mediator,
    Promise
) {

    var omniture;

    /**
     * The omniture module depends on common/modules/experiments/ab, so trying to
     * require omniture directly inside an AB test gives you a circular dependency.
     *
     * This is a workaround to load omniture without making it a dependency of
     * this module, which is required by an AB test.
     */
    function getOmniture() {
        return new Promise(function (resolve) {
            if (omniture) {
                return resolve(omniture);
            }

            require('common/modules/analytics/omniture', function (omnitureM) {
                omniture = omnitureM;
                resolve(omniture);
            });
        });
    }

    return function () {
        this.id = 'ParticipationLowFricRecipes';
        this.start = '2016-05-11';
        this.expiry = '2016-06-15';
        this.author = 'Gareth Trufitt - Participation';
        this.description = 'Initial user segmentation to ensure statistical significance';
        this.audience = 0.1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'Users on recipe pages that have comments turned on';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            // Commentable, recipes
            return config.page.toneIds &&
                config.page.toneIds.indexOf('tone/recipes') !== -1 &&
                config.page.commentable;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: function (complete) {
                    mediator.on('discussion:commentbox:post:success', function (){
                        // Data lake
                        complete();

                        // Omniture
                        getOmniture().then(function (omniture) {
                            omniture.trackLinkImmediate('ab | ParticipationLowFricRecipes | control | complete');
                        });
                    });
                }
            },
            {
                id: 'variant-1',
                test: function () {}
            }
        ];
    };
});
