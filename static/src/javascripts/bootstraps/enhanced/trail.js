/*eslint-disable no-new*/
/** Bootstrap for functionality common to all trail pages: article, live blogs, podcasts, videos, etc. */
define([
    'enhancer',
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/contains',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/proximity-loader',
    'common/utils/detect',
    'common/modules/commercial/comment-adverts',
    'common/modules/discussion/loader',
    'common/modules/identity/api',
    'common/modules/onward/onward-content',
    'common/modules/onward/popular',
    'common/modules/onward/related',
    'common/modules/onward/tonal',
    'common/modules/onward/fronts-containers',
    'common/modules/social/share-count',
    'common/modules/experiments/ab'
], function (
    enhancer,
    fastdom,
    qwery,
    $,
    config,
    contains,
    mediator,
    robust,
    proximityLoader,
    detect,
    commentAdverts,
    DiscussionLoader,
    identityApi,
    Onward,
    Popular,
    Related,
    TonalComponent,
    FrontsContainers,
    shareCount,
    ab
) {
    // messy but removed within a week
    var blogIdsCheck = (ab.getParticipations().FrontsOnArticles2 &&
    (ab.getParticipations().FrontsOnArticles2.variant === 'oneAndThree' || ab.getParticipations().FrontsOnArticles2.variant === 'twoAndTwo') &&
    ab.testCanBeRun('FrontsOnArticles2')) ? (config.page.blogIds && !(config.page.blogIds.indexOf('commentisfree') > -1)) : config.page.blogIds;

    function insertOrProximity(selector, insert) {
        if (window.location.hash) {
            insert();
        } else {
            var el = qwery(selector)[0];

            if (el) {
                proximityLoader.add(el, 1500, insert);
            }
        }
    }

    function initPopular() {
        if (!config.page.isFront) {
            insertOrProximity('.js-popular-trails', function () {
                new Popular().init();
            });
        }
    }

    function initRelated() {
        if (!(config.page.seriesId || blogIdsCheck)) {
            insertOrProximity('.js-related', function () {
                var opts = {
                    excludeTags: []
                };

                // exclude ad features from non-ad feature content
                if (config.page.sponsorshipType !== 'advertisement-features') {
                    opts.excludeTags.push('tone/advertisement-features');
                }
                // don't want to show professional network content on videos or interactives
                if ('contentType' in config.page &&
                    contains(['video', 'interactive'], config.page.contentType.toLowerCase())) {
                    opts.excludeTags.push('guardian-professional/guardian-professional');
                }
                new Related(opts).renderRelatedComponent();
            });
        }
    }

    function initOnwardContent() {
        insertOrProximity('.js-onward', function () {
            if ((config.page.seriesId || blogIdsCheck) && config.page.showRelatedContent) {
                new Onward(qwery('.js-onward'));
            } else if (config.page.tones !== '') {
                if (!(ab.getParticipations().FrontsOnArticles2 &&
                    (ab.getParticipations().FrontsOnArticles2.variant === 'oneAndThree' || ab.getParticipations().FrontsOnArticles2.variant === 'twoAndTwo') &&
                    ab.testCanBeRun('FrontsOnArticles2'))) {
                    $('.js-onward').each(function (c) {
                        new TonalComponent().fetch(c, 'html');
                    });
                }
            }
        });
    }

    function initFrontsContainers() {
        if (config.page.section !== 'childrens-books-site' && config.page.contentType !== 'LiveBlog' && ab.getParticipations().FrontsOnArticles2 &&
            (ab.getParticipations().FrontsOnArticles2.variant === 'oneAndThree' || ab.getParticipations().FrontsOnArticles2.variant === 'twoAndTwo') &&
            ab.testCanBeRun('FrontsOnArticles2')) {
            insertOrProximity('.js-onward', function () {
                new FrontsContainers();
            });
        }
    }

    function initDiscussion() {
        if (config.switches.discussion && config.page.commentable) {
            var el = qwery('.discussion')[0];
            if (el) {
                new DiscussionLoader().attachTo(el);
            }
        }
    }

    function augmentInteractive() {
        if (/Article|Interactive|LiveBlog/.test(config.page.contentType)) {
            $('figure.interactive').each(function (el) {
                fastdom.defer(function () {
                    enhancer.render(el, document, config, mediator);
                });
            });
        }
    }

    function repositionComments() {
        if (!identityApi.isUserLoggedIn()) {
            fastdom.write(function () {
                $('.js-comments').appendTo(qwery('.js-repositioned-comments'));
            });
        }
    }

    return function () {
        robust.catchErrorsAndLogAll([
            ['c-discussion', initDiscussion],
            ['c-comments', repositionComments],
            ['c-fronts-containers', initFrontsContainers],
            ['c-enhance', augmentInteractive],
            ['c-shares', shareCount],
            ['c-popular', initPopular],
            ['c-related', initRelated],
            ['c-onward', initOnwardContent],
            ['c-comment-adverts', commentAdverts]
        ]);
    };
});
