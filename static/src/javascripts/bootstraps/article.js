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
    'common/modules/article/truncation',
    'common/modules/experiments/ab',
    'common/modules/onward/geo-most-popular',
    'common/modules/onward/social-most-popular',
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
    truncation,
    ab,
    geoMostPopular,
    SocialMostPopular,
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

            initSocialMostPopular: function () {
                var el = qwery('.js-social-most-popular');

                if (el) {
                    if (ab.shouldRunTest('ArticleTruncation', 'variant')) {
                        new SocialMostPopular(el, detect.socialContext());
                    } else {
                        ['Twitter', 'Facebook'].forEach(function (socialContext) {
                            if (ab.shouldRunTest(socialContext + 'MostViewed', 'variant')) {
                                new SocialMostPopular(el, socialContext.toLowerCase());
                            }
                        });
                    }
                }
            },

            initPintrest: function () {
                if (ab.shouldRunTest('Pintrest', 'variant')) {
                    $('.social__item--pinterest').each(function (el) {
                        $(el).css('display', 'block');
                        bean.on(el, 'click', function (event) {
                            event.preventDefault();
                            require(['js!https://assets.pinterest.com/js/pinmarklet.js?r=' + new Date().getTime()]);
                        });
                    });
                }
            },

            initQuizListeners: function () {
                require(['ophan/ng'], function (ophan) {
                    mediator.on('quiz/ophan-event', ophan.record);
                });
            },

            initTruncation: function () {
                if (ab.shouldRunTest('ArticleTruncation', 'variant')) {
                    truncation();
                }
            }
        },

        ready = function () {
            trail();
            articleLiveblogCommon();
            modules.initRightHandComponent();
            modules.initCmpParam();
            modules.initSocialMostPopular();
            modules.initQuizListeners();
            modules.initPintrest();
            modules.initTruncation();
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
