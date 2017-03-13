/*eslint-disable no-new*/
define([
    'qwery',
    'bean',
    'lib/$',
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'lib/url',
    'common/modules/article/rich-links',
    'common/modules/article/membership-events',
    'common/modules/article/open-module',
    'common/modules/experiments/ab',
    'common/modules/onward/geo-most-popular',
    'common/modules/atoms/quiz',
    'bootstraps/enhanced/article-liveblog-common',
    'bootstraps/enhanced/trail',
    'ophan/ng'
], function (
    qwery,
    bean,
    $,
    config,
    detect,
    mediator,
    urlutils,
    richLinks,
    membershipEvents,
    openModule,
    ab,
    geoMostPopular,
    quiz,
    articleLiveblogCommon,
    trail,
    ophan
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
                geoMostPopular.render();
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
        articleLiveblogCommon();
        modules.initRightHandComponent();
        modules.initCmpParam();
        modules.initQuizListeners();
        richLinks.upgradeRichLinks();
        richLinks.insertTagRichLink();
        membershipEvents.upgradeEvents();
        openModule.init();
        mediator.emit('page:article:ready');
        quiz.handleCompletion();
    };

    return {
        init: ready,
        modules: modules // exporting for LiveBlog bootstrap to use
    };
});
