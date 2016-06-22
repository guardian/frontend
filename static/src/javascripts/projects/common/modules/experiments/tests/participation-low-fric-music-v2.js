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

    function trackIntoOmniture(trackStr) {
        getOmniture().then(function (omniture) {
            omniture.trackLinkImmediate(trackStr);
        });
    }

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
                test: function () {
                    // Omniture
                    trackIntoOmniture('ab | ParticipationLowFricMusicV2 | control | setup');
                },
                success: function (complete) {
                    if (module.canRun()) {
                        mediator.on('discussion:commentbox:post:success', function () {
                            // Data lake
                            complete();

                            // Omniture
                            trackIntoOmniture('ab | ParticipationLowFricMusicV2 | control | complete');
                        });
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

                    // Omniture
                    trackIntoOmniture('ab | ParticipationLowFricMusicV2 | variant-1 | setup');
                },
                success: function (complete) {
                    if (module.canRun()) {
                        mediator.on('modules:participation:clicked', function (){
                            // Data lake
                            complete();

                            // Omniture
                            trackIntoOmniture('ab | ParticipationLowFricMusicV2 | variant-1 | success');
                        });
                    }
                }
            }
        ];
    };
});
