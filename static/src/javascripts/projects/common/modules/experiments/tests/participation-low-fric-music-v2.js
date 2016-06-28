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

    function possessive(name) {
        var lastChar = name.substr(-1);
        var postfix = (lastChar === 's') ? '\'' : '\'s';
        return name + postfix;
    }

    return function () {

        var module = this;

        this.id = 'ParticipationLowFricMusicV2';
        this.start = '2016-06-21';
        this.expiry = '2016-06-29';
        this.author = 'Gareth Trufitt - Participation';
        this.description = 'Participation - Low friction test for star ratings on Music';
        this.audience = 0.1;
        this.audienceOffset = 0.1;
        this.successMeasure = 'Control - User comments, Variant - User rates';
        this.audienceCriteria = 'Users on gig reviews, that have comments turned on (~10% for 6 days)';
        this.dataLinkNames = '';
        this.idealOutcome = 'On pages with comments, we can see at least 2x more participation on star ratings than user\'s commenting';

        this.canRun = function () {

            // Commentable, live reviews
            return detect.isEnhanced() &&
                config.page.section === 'music' &&
                config.page.commentable &&
                config.page.toneIds &&
                !!config.page.toneIds.match('tone/livereview');
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: function (complete) {
                    if (module.canRun()) {
                        mediator.on('discussion:commentbox:post:success', complete);
                    }
                }
            },
            {
                id: 'variant-1',
                test: function () {
                    lowFrictionParticipation.init({
                        templateVars: {
                            title: 'Did you see this?',
                            description: 'Is your rating the same as ' + possessive(config.page.author) + ' on "' + config.page.headline + '"?'
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
