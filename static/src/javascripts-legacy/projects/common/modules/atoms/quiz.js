define(
    ['bean', 'lib/$', 'lib/fastdom-promise', 'lodash/collections/toArray'],
    function(bean, $, fastdom, toArray) {
        return {
            // find a bucket message to show once you finish a quiz
            handleCompletion: function() {
                // we're only handling completion in browsers who can validate forms natively
                // others do a round trip to the server
                if (HTMLFormElement.prototype.checkValidity) {
                    // quizzes can be set to only show answers at the end, in which case we do a round trip.
                    // we'll run this code only if it's an instant-reveal quiz
                    var $quizzes = $('.js-atom-quiz--instant-reveal');

                    if ($quizzes.length > 0) {
                        bean.on(document, 'click', toArray($quizzes), function(
                            e
                        ) {
                            var quiz = e.currentTarget,
                                total = $(
                                    ':checked + .atom-quiz__answer__item--is-correct',
                                    quiz
                                ).length;

                            if (quiz.checkValidity()) {
                                // the form (quiz) is complete
                                var $bucket__message = null;
                                do {
                                    // try and find a .bucket__message for your total
                                    $bucket__message = $(
                                        '.js-atom-quiz__bucket-message--' +
                                            total,
                                        quiz
                                    );

                                    // if we find a message for your total show it, and exit
                                    if ($bucket__message.length > 0) {
                                        fastdom.write(function() {
                                            $bucket__message.css({
                                                display: 'block',
                                            });
                                        });
                                        break;
                                    }

                                    // if we haven't exited, there's no .bucket__message for your score, so you must be in
                                    // a bucket with a range that begins below your total score
                                    total--;
                                } while (total >= 0); // the lowest we'll look is for 0 correct answers
                            }
                        });
                    }
                }
            },
        };
    }
);
