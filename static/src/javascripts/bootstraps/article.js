/*eslint-disable no-new*/
define([
    'qwery',
    'bean',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/url',
    'common/modules/article/rich-links',
    'common/modules/article/membership-events',
    'common/modules/article/open-module',
    'common/modules/experiments/ab',
    'common/modules/onward/geo-most-popular',
    'bootstraps/article-liveblog-common',
    'bootstraps/trail'
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
    articleLiveblogCommon,
    trail
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
                }
            },

            initQuizListeners: function () {
                require(['ophan/ng'], function (ophan) {
                    mediator.on('quiz/ophan-event', ophan.record);
                });
            },

            initMostPopRelContentTest: function () {
                //switch position of related content and most popular
                if (ab.getParticipations().MostPopRelContPosition && ab.getParticipations().MostPopRelContPosition.variant === 'switched') {
                    var $mostPop = $('.js-most-popular-footer'),
                        $onwardEl = $('.related'),
                        markOnwardPos = $onwardEl.next(),
                        markMostPopularPos = $mostPop.next();

                    $mostPop.insertBefore(markOnwardPos);
                    $mostPop.attr('data-link-name', $mostPop.attr('data-link-name') + ' most-popular-ab1');

                    $onwardEl.insertBefore(markMostPopularPos);
                    $onwardEl.attr('data-link-name', 'onward-ab1');
                }
            }
        },

        ready = function () {
            trail();
            articleLiveblogCommon();
            modules.initRightHandComponent();
            modules.initCmpParam();
            modules.initQuizListeners();
            modules.initMostPopRelContentTest();
            richLinks.upgradeRichLinks();
            richLinks.insertTagRichLink();
            membershipEvents.upgradeEvents();
            openModule.init();
            mediator.emit('page:article:ready');
        };

    return {
        init: ready,
        modules: modules // exporting for LiveBlog bootstrap to use
    };
});
