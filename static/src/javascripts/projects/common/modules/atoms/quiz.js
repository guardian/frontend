define([
    'common/utils/$',
    'lodash/collections/forEach'
], function (
    $,
    forEach
) {
    var $quizzes = $('.quiz');
    var quizAnswerLabelClassName = 'quiz__answer';
    var quizAnswerLabelCheckedClassName = quizAnswerLabelClassName + '--checked';
    var quizAnswerLabelFocussedClassName = quizAnswerLabelClassName + '--focussed';
    var quizAnswerInputClassName = quizAnswerLabelClassName + '__input';

    function renderLabels(state) {
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
    }

    function renderQuizzes() {
        $quizzes.each(function (quizElement) {
            var $quizLabels = $('.quiz__answer', quizElement);

            renderLabels({
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
    }

    function matches(element, selector) {
        var matchFunc = (element.matchesSelector || element.matches).bind(element);
        return matchFunc(selector);
    }

    function init() {

        // Bean doesn't support capturing so we have to delegate ourselves.
        var delegateEvent = function (parentEl, event, childElSelector, fn, useCapture) {
            parentEl.addEventListener(event, function (event) {
                if (matches(event.target, childElSelector)) {
                    fn(event);
                }
            }, useCapture);
        };

        $quizzes.each(function (quizElement) {
            delegateEvent(quizElement, 'focus', '.' + quizAnswerInputClassName, renderQuizzes, true);
            delegateEvent(quizElement, 'blur', '.' + quizAnswerInputClassName, renderQuizzes, true);
            delegateEvent(quizElement, 'change', '.' + quizAnswerInputClassName, renderQuizzes, false);
        });

        renderQuizzes();
    }

    return {
        init: init
    };
});
