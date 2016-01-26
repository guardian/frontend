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
    'bootstraps/enhanced/trail',
    'lodash/collections/forEach'
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
    trail,
    forEach
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
                    forEach(state.labels, function (label) {
                        if (label.isChecked) {
                            label.$el.addClass(state.labelCheckedClassName);
                        } else {
                            label.$el.removeClass(state.labelCheckedClassName);
                        }

                        if (label.isFocussed) {
                            label.$el.addClass(state.labelFocussedClassName);
                        } else {
                            label.$el.removeClass(state.labelFocussedClassName);
                        }
                    });
                };

                var renderQuiz = function (state) {
                    renderLabels(state);
                };

                var $quizzes = $('.quiz');
                var quizAnswerLabelClassName = 'quiz__answer';
                var quizAnswerLabelCheckedClassName = quizAnswerLabelClassName + '--checked';
                var quizAnswerLabelFocussedClassName = quizAnswerLabelClassName + '--focussed';
                var quizAnswerInputClassName = quizAnswerLabelClassName + '__input';

                var renderQuizzes = function () {
                    $quizzes.each(function (quizElement) {
                        var $quizLabels = $('.quiz__answer', quizElement);

                        renderQuiz({
                            labels: $quizLabels.map(function (labelEl) {
                                var inputEl = $('.' + quizAnswerInputClassName, labelEl)[0];
                                var isChecked = inputEl.checked;
                                return {
                                    $el: $(labelEl),
                                    isChecked: isChecked,
                                    isFocussed: document.activeElement === inputEl
                                };
                            }),
                            inputClassName: quizAnswerInputClassName,
                            labelCheckedClassName: quizAnswerLabelCheckedClassName,
                            labelFocussedClassName: quizAnswerLabelFocussedClassName
                        });
                    });
                };

                var update = function () {
                    renderQuizzes();
                };

                var matches = function (element, selector) {
                    return (element.matchesSelector || element.matches)(selector);
                };

                // Bean doesn't support capturing so we have to delegate
                // ourselves
                var delegateEvent = function (parentEl, event, childElSelector, fn, useCapture) {
                    parentEl.addEventListener(event, function (event) {
                        if (matches(event.target, childElSelector)) {
                            fn(event);
                        }
                    }, useCapture);
                };


                $quizzes.each(function (quizElement) {
                    delegateEvent(quizElement, 'focus', '.' + quizAnswerInputClassName, update, true);
                    delegateEvent(quizElement, 'blur', '.' + quizAnswerInputClassName, update, true);
                    bean.on(quizElement, 'change', '.' + quizAnswerInputClassName, update);
                });

                update();
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
