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

    var omniture,
        isAGigReview,
        isAnAlbumReview;

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

    function possessive(name) {
        var lastChar = name.substr(-1);
        var postfix = (lastChar === 's') ? '\'' : '\'s';
        return name + postfix;
    }

    return function () {
        this.id = 'ParticipationLowFricMusicV1';
        this.start = '2016-05-23';
        this.expiry = '2016-06-07';
        this.author = 'Gareth Trufitt - Participation';
        this.description = 'Participation - Low friction test for star ratings on Music';
        this.audience = 0.1;
        this.audienceOffset = 0.1;
        this.successMeasure = 'Control - User comments, Variant - User rates';
        this.audienceCriteria = 'Users on music reviews by Kitty or Alexis or gig reviews, that have comments turned on (~10% for 6 days)';
        this.dataLinkNames = '';
        this.idealOutcome = 'On pages with comments, we can see at least 2x more participation on star ratings than user\'s commenting';

        this.canRun = function () {
            function albumReviewByAuthors (authors) {

                isAnAlbumReview = config.page.toneIds && !!config.page.toneIds.match('tone/albumreview');

                return isAnAlbumReview &&
                    config.page.authorIds &&
                    !!config.page.authorIds.match(new RegExp(authors.join('|')));
            }

            function liveReview () {
                isAGigReview = config.page.toneIds && !!config.page.toneIds.match('tone/livereview');

                return isAGigReview;
            }

            // Commentable, album reviews by Alexis or Kitty or all live reviews
            return detect.isEnhanced() &&
                config.page.section === 'music' &&
                config.page.commentable &&
                (albumReviewByAuthors(['profile/alexispetridis','profile/kittyempire']) || liveReview());
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
                            omniture.trackLinkImmediate('ab | ParticipationLowFricMusic | control | complete');
                        });
                    });
                }
            },
            {
                id: 'variant-1',
                test: function () {
                    var starRatings = Object.create(lowFrictionParticipation),
                        description = '',
                        reviewType = (isAnAlbumReview) ? 'album' : 'gig';

                    if (config.page.headline && config.page.author) {
                        description = 'Is your rating the same as ' + possessive(config.page.author) + ' on "' + config.page.headline + '"?';
                    }

                    starRatings.init({
                        templateVars: {
                            title: 'Do you agree? Rate this ' + reviewType + '!',
                            description: description
                        }
                    });
                },
                success: function (complete) {
                    mediator.on('modules:participation:clicked', function (){
                        // Data lake
                        complete();

                        // Omniture
                        getOmniture().then(function (omniture) {
                            omniture.trackLinkImmediate('ab | ParticipationLowFricMusicV1 | variant-1 | success');
                        });
                    });
                }
            }
        ];
    };
});
