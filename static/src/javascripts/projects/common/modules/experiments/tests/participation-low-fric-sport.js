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
        
        this.id = 'ParticipationLowFricSport';
        this.start = '2016-05-25';
        this.expiry = '2016-06-08';
        this.author = 'Gareth Trufitt - Participation';
        this.description = 'Participation - Low friction test for football ratings on Football';
        this.audience = 0.05;
        this.audienceOffset = 0.45;
        this.successMeasure = 'Control - User comments, Variant - User rates';
        this.audienceCriteria = 'Match reports that have comments turned on (5% for 7 days)';
        this.dataLinkNames = '';
        this.idealOutcome = 'On pages with comments, we can see at least 2x more participation on football ratings than user\'s commenting';

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
                        mediator.on('modules:participation:clicked', complete);
                    }
                }
            }
        ];
    };
});
