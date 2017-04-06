define([
    'lib/$',
    'bean',
    'ophan/ng'
], function (
    $,
    bean,
    ophan
) {

    function askQuestion(event) {
        event.preventDefault();
        var questionId = event.currentTarget.querySelector('.user__question-upvote').id;
        var question = $('#js-question-text-' + questionId).text();
        var atomId = $('.js-storyquestion-atom-id').attr('id');

        if (question && atomId) {
            $('#' + questionId).addClass('is-hidden');
            $('#js-question-thankyou-' + questionId).removeClass('is-hidden');

            ophan.record({
                atomId: atomId,
                component: question,
                value: 'question_asked'
            });
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
        }
    };

});
