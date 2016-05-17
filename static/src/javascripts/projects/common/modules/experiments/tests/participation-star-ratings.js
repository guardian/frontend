define([
    'common/utils/config',
    'common/utils/mediator',
    'Promise',
    'common/modules/experiments/low-friction-participation'
], function (
    config,
    mediator,
    Promise,
    lowFrictionParticipation
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
        this.id = 'ParticipationStarRatings';
        this.start = '2016-05-11';
        this.expiry = '2016-06-13';
        this.author = 'Gareth Trufitt - Participation';
        this.description = 'Initial user segmentation to ensure statistical significance';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'Users on film review pages that have comments turned on';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            // Commentable, Film reviews
            return config.page.section === 'film' &&
                config.page.toneIds === 'tone/reviews' &&
                config.page.commentable &&
                Object.create; // Filters out IE8.
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
                            omniture.trackLinkImmediate('ab | participationStarRatings | control');
                        });
                    });
                }
            },
            {
                id: 'star-rating',
                test: function () {
                    if (Object.create) {
                        var starRatings = Object.create(lowFrictionParticipation);
                        starRatings.init({
                            templateVars: {
                                description: 'Let us know whether you agree with "' + config.page.headline + '"'
                            }
                        });
                    }
                },
                success: function (complete) {
                    mediator.on('modules:participation:clicked', function (){
                        // Data lake
                        complete();

                        // Omniture
                        getOmniture().then(function (omniture) {
                            omniture.trackLinkImmediate('ab | participationStarRatings | star-rating');
                        });
                    });
                }
            }
        ];
    };
});
