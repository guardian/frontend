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
        this.id = 'ParticipationLowFricFilm';
        this.start = '2016-05-24';
        this.expiry = '2016-06-08';
        this.author = 'Gareth Trufitt - Participation';
        this.description = 'Participation - Low friction test for star ratings on Film';
        this.audience = 0.45;
        this.audienceOffset = 0.2;
        this.successMeasure = 'Control - User comments, Variant - User rates';
        this.audienceCriteria = 'Film reviews that have comments turned on (45% for 7 days)';
        this.dataLinkNames = '';
        this.idealOutcome = 'On pages with comments, we can see at least 1.5x more participation on star ratings than user\'s commenting';

        this.canRun = function () {
            // Commentable, Film reviews
            return detect.isEnhanced() &&
                config.page.section === 'film' &&
                config.page.toneIds === 'tone/reviews' &&
                config.page.commentable;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: function (complete) {
                    mediator.on('discussion:commentbox:post:success',  complete);
                }
            },
            {
                id: 'variant-1',
                test: function () {
                    var starRatings = Object.create(lowFrictionParticipation),
                        description = '';

                    if (config.page.headline && config.page.author) {
                        description = 'Is your rating the same as ' + possessive(config.page.author) + ' on "' + config.page.headline + '"?';
                    }

                    starRatings.init({
                        templateVars: {
                            description: description
                        }
                    });
                },
                success: function (complete) {
                    mediator.on('modules:participation:clicked', complete);
                }
            }
        ];
    };
});
