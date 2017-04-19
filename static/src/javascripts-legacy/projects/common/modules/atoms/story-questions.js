define([
    'lib/mediator',
    'lib/detect',
    'lib/$',
    'bean',
    'ophan/ng'
], function (
    mediator,
    detect,
    $,
    bean,
    ophan
) {

    function askQuestion(event) {
        event.preventDefault();
        var questionElement = event.currentTarget.querySelector('.user__question-upvote');
        var atomIdElement = $('.js-storyquestion-atom-id');

        if (questionElement && atomIdElement) {
            var questionId = questionElement.id;
            var atomId = atomIdElement.attr('id');

            var question = document.querySelector("meta[name=js-notranslate-" + questionId + "]");

            if (question) {
                var questionText = question.content;

                if (questionText && atomId) {

                    var questionElementClicked = $('#' + questionId);
                    var thankYouMessage = $('#js-question-thankyou-' + questionId);

                    if (questionElementClicked && thankYouMessage) {
                        questionElementClicked.addClass('is-hidden');
                        thankYouMessage.removeClass('is-hidden');
                    }

                    ophan.record({
                        atomId: atomId.trim(),
                        component: questionText.trim(),
                        value: 'question_asked'
                    });
                }
            }
        }
    }

    return {
        init: function() {
            var askQuestionLinks = $('.js-ask-question-link');

            if (askQuestionLinks) {
                askQuestionLinks.each(function (el) {
                    bean.on(el, 'click', askQuestion);
                });
            }

            var storyQuestionsComponent = document.querySelector('.js-view-tracking-component');
            var atomElement = $('.js-storyquestion-atom-id');

            if (storyQuestionsComponent && atomElement) {

                mediator.on('window:throttledScroll', function onScroll() {
                    var height = detect.getViewport().height;
                    var coords = storyQuestionsComponent.getBoundingClientRect();
                    var isStoryQuestionsInView = 0 <= coords.top && coords.bottom <= height;

                    if (isStoryQuestionsInView) {
                        var atomId = atomElement.attr('id');

                        if (atomId) {
                            ophan.record({
                                atomId: atomId.trim(),
                                component: atomId.trim(),
                                value: 'question_component_in_view'
                            });
                        }

                        mediator.off('window:throttledScroll', onScroll);
                    }
                });
            }
        }
    };

});
