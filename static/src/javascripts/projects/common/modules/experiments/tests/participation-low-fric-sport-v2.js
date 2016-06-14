define([
    'common/utils/config',
    'common/utils/mediator',
    'Promise',
    'common/utils/detect',
    'common/modules/experiments/low-friction-participation'
], function (
    config,
    mediator,
    Promise,
    detect,
    lowFrictionParticipation
) {

    return function () {
        var module = this;

        this.id = 'ParticipationLowFricSportV2';
        this.start = '2016-06-06';
        this.expiry = '2016-06-21';
        this.author = 'Gareth Trufitt - Participation';
        this.description = 'Participation - Low friction test for football vs star ratings on Football';
        this.audience = 0.1;
        this.audienceOffset = 0.4;
        this.successMeasure = 'Control - User comments, Variant 1 - User rates with footballs, Variant 2 - User rates with stars';
        this.audienceCriteria = 'Match reports that have comments turned on (10% for 7 days)';
        this.dataLinkNames = '';
        this.idealOutcome = 'We can see at least 50% more participation on star ratings than football ratings';

        this.canRun = function () {
            // Commentable, Football match reports
            return detect.isEnhanced() &&
                config.page.section === 'football' &&
                config.page.toneIds === 'tone/matchreports' &&
                config.page.commentable;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: function (complete) {
                    if (module.canRun()) {
                        mediator.on('discussion:commentbox:post:success',  complete);
                    }
                }
            },
            {
                id: 'variant-1',
                test: function () {
                    lowFrictionParticipation.init({
                        itemCount: 5,
                        itemIconUnicode: ['&#x26BD;'],
                        templateVars: {
                            title: 'Rate this match!',
                            description: 'Let us know how many marks out of 5 you thought this game deserved.',
                            itemClassSuffix: 'football'
                        }
                    });
                },
                success: function (complete) {
                    if (module.canRun()) {
                        mediator.on('modules:participation:clicked',  complete);
                    }
                }
            },
            {
                id: 'variant-2',
                test: function () {
                    lowFrictionParticipation.init({
                        templateVars: {
                            title: 'Rate this match!',
                            description: 'Let us know how many marks out of 5 you thought this game deserved.'
                        }
                    });
                },
                success: function (complete) {
                    if (module.canRun()) {
                        mediator.on('modules:participation:clicked',  complete);
                    }
                }
            }
        ];
    };
});
