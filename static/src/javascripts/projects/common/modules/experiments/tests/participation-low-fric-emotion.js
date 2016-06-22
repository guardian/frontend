define([
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/detect',
    'Promise',
    'common/modules/experiments/low-friction-participation',
    'inlineSvg!svgs/icon/emotion-happy',
    'inlineSvg!svgs/icon/emotion-sad',
    'inlineSvg!svgs/icon/emotion-confused',
    'inlineSvg!svgs/icon/emotion-love',
    'inlineSvg!svgs/icon/emotion-laughing'
], function (
    config,
    mediator,
    detect,
    Promise,
    lowFrictionParticipation,
    iconHappy,
    iconSad,
    iconConfused,
    iconLove,
    iconLaughing
) {

    /**
     * The omniture module depends on common/modules/experiments/ab, so trying to
     * require omniture directly inside an AB test gives you a circular dependency.
     *
     * This is a workaround to load omniture without making it a dependency of
     * this module, which is required by an AB test.
     */
    var omniture;

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
        var module = this;

        this.id = 'ParticipationLowFricEmotion';
        this.start = '2016-06-20';
        this.expiry = '2016-07-05';
        this.author = 'Gareth Trufitt - Participation';
        this.description = 'Participation - Low friction test for emotions';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Control - User comments, Variant 1 - User clicks an emotion';
        this.audienceCriteria = 'Commentable articles'; // Article types - TBC
        this.dataLinkNames = '';
        this.idealOutcome = 'We can see at least 50% more participation on emotional responses than comments';

        this.canRun = function () {
            // Commentable
            return detect.isEnhanced() &&
                config.page.commentable;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    // Omniture
                    getOmniture().then(function (omniture) {
                        omniture.trackLinkImmediate('ab | ParticipationLowFricEmotion | control | setup');
                    });
                },
                success: function (complete) {
                    if (module.canRun()) {
                        mediator.on('discussion:commentbox:post:success',  function(){
                            // Data lake
                            complete();

                            // Omniture
                            getOmniture().then(function (omniture) {
                                omniture.trackLinkImmediate('ab | ParticipationLowFricEmotion | control | complete');
                            });
                        });
                    }
                }
            },
            {
                id: 'variant-1',
                test: function () {
                    lowFrictionParticipation.init({
                        itemCount: 5,
                        prevItemsHighlight: false,
                        itemIconArray: [iconHappy, iconSad, iconConfused, iconLove, iconLaughing],
                        buttonTextArray: ['Happy', 'Sad', 'Confused', 'I love it', 'Amused'],
                        templateVars: {
                            title: 'How did this article make you feel?',
                            description: '',
                            itemClassSuffix: 'emotion',
                            confirmButton: 'Confirm',
                            typeId: 'emotions'
                        }
                    });

                    // Omniture
                    getOmniture().then(function (omniture) {
                        omniture.trackLinkImmediate('ab | ParticipationLowFricEmotion | variant-1 | setup');
                    });
                },
                success: function (complete) {
                    if (module.canRun()) {
                        mediator.on('modules:participation:clicked',  function(){
                            // Data lake
                            complete();

                            // Omniture
                            getOmniture().then(function (omniture) {
                                omniture.trackLinkImmediate('ab | ParticipationLowFricEmotion | variant-1 | complete');
                            });
                        });
                    }
                }
            }
        ];
    };
});
