/*eslint-disable no-new*/
define([
    'qwery',
    'lib/$',
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'lib/url',
    'common/modules/article/rich-links',
    'common/modules/article/membership-events',
    'common/modules/experiments/ab',
    'common/modules/onward/geo-most-popular',
    'common/modules/atoms/quiz',
    'common/modules/atoms/story-questions',
    'bootstraps/enhanced/article-liveblog-common',
    'bootstraps/enhanced/trail',
    'ophan/ng',
    'projects/journalism/snippet-feedback'
], function (
    qwery,
    $,
    config,
    detect,
    mediator,
    urlutils,
    richLinks,
    membershipEvents,
    ab,
    geoMostPopular,
    quiz,
    storyQuestions,
    articleLiveblogCommon,
    trail,
    ophan,
    snippetFeedback
) {
    var modules = {
        initCmpParam: function () {
            var allvars = urlutils.getUrlVars();

            if (allvars.CMP) {
                $('.element-pass-cmp').each(function (el) {
                    el.src = el.src + '?CMP=' + allvars.CMP;
                });
            }
        },

        initRightHandComponent: function () {
            var mainColumn = qwery('.js-content-main-column');
            // only render when we have >1000px or more (enough space for ad + most popular)
            if (mainColumn[0] && mainColumn[0].offsetHeight > 1150 && detect.isBreakpoint({ min: 'desktop' })) {
                geoMostPopular.geoMostPopular.render();
            } else {
                mediator.emit('modules:onward:geo-most-popular:cancel');
            }
        },

        initQuizListeners: function () {
            // This event is for older-style quizzes implemented as interactives. See https://github.com/guardian/quiz-builder
            mediator.on('quiz/ophan-event', ophan.record);
        }
    },

    ready = function () {
        trail();
        articleLiveblogCommon.init();
        modules.initRightHandComponent();
        modules.initCmpParam();
        modules.initQuizListeners();
        richLinks.upgradeRichLinks();
        richLinks.insertTagRichLink();
        membershipEvents.upgradeEvents();
        mediator.emit('page:article:ready');
        quiz.handleCompletion();
        storyQuestions.init();
        snippetFeedback.SnippetFeedback();
    };

    return {
        init: ready,
        modules: modules // exporting for LiveBlog bootstrap to use
    };
});
