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
    'common/modules/article/chapters',
    'common/modules/experiments/ab',
    'common/modules/onward/geo-most-popular',
    'bootstraps/enhanced/article-liveblog-common',
    'bootstraps/enhanced/trail'
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
    chapters,
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

            initAtomQuiz: function () {
                // TODO: Only run for quizzes
                var renderLabels = function (state) {
                    state.$labels.each(function (labelEl) {
                        var inputEl = $('.' + state.inputClassName, labelEl)[0];
                        var isChecked = inputEl.checked;
                        var $labelEl = $(labelEl);
                        var isFocussed = document.activeElement === inputEl;
                        if (isChecked) {
                            $(labelEl).addClass(state.labelCheckedClassName);
                        } else {
                            $(labelEl).removeClass(state.labelCheckedClassName);
                        }

                        if (isFocussed) {
                            $labelEl.addClass(state.labelFocussedClassName);
                        } else {
                            $labelEl.removeClass(state.labelFocussedClassName);
                        }
                    });
                };

                var renderQuiz = function () {
                    var $quizzes = $('.quiz');
                    var quizAnswerLabelClassName = 'quiz__answer';
                    var quizAnswerLabelCheckedClassName = quizAnswerLabelClassName + '--checked';
                    var quizAnswerLabelFocussedClassName = quizAnswerLabelClassName + '--focussed';
                    var quizAnswerInputClassName = 'quiz__answer' + '__input';
                    $quizzes.each(function (quizElement) {
                        var $quizLabels = $('.quiz__answer', quizElement);
                        var renderQuizLabels = function () {
                            renderLabels({
                                $labels: $quizLabels,
                                inputClassName: quizAnswerInputClassName,
                                labelCheckedClassName: quizAnswerLabelCheckedClassName,
                                labelFocussedClassName: quizAnswerLabelFocussedClassName
                            });
                        };

                        window.addEventListener('focus', renderQuizLabels, true);
                        window.addEventListener('blur', renderQuizLabels, true);
                        bean.on(quizElement, 'change', '.' + quizAnswerInputClassName, renderQuizLabels);
                        renderQuizLabels();
                    });
                };

                renderQuiz();
            }
        },

        ready = function () {
            trail();
            articleLiveblogCommon();
            modules.initRightHandComponent();
            modules.initCmpParam();
            modules.initQuizListeners();
            modules.initAtomQuiz();
            richLinks.upgradeRichLinks();
            richLinks.insertTagRichLink();
            membershipEvents.upgradeEvents();
            chapters.init();
            openModule.init();
            mediator.emit('page:article:ready');
        };

    return {
        init: ready,
        modules: modules // exporting for LiveBlog bootstrap to use
    };
});
