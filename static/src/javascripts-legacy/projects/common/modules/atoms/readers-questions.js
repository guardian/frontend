define([
    'lib/$',
    'bean',
    'ophan/ng'
], function (
    $,
    bean,
    ophan
) {

    function upvote(event) {
        event.preventDefault();
        var questionId = event.target.id;
        var question = $('#js-question-text-' + questionId).text();
        var atomId = $('.js-storyquestion-atom-id').attr('id');

        $('#' + questionId).hide();
        $('#js-question-thankyou-' + questionId).toggle();

        ophan.record({
            atomId: atomId,
            component: question,
            value: 'upvote'
        });
    }

    return {
        init: function() {
            var questionUpvoteLinks = $('.js-question-upvote-link');

            questionUpvoteLinks.each(function (el) {
                bean.on(el, 'click', upvote);
            });
        }
    };

});
