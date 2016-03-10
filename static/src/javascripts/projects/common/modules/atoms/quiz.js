define([
    'bean',
    'common/utils/$',
    'common/utils/fastdom-promise'
], function (
    bean,
    $,
    fastdom
) {
    return {
        handleCompletion: function () {
            if (!!HTMLFormElement.prototype.checkValidity) {
                var $quiz = $('.js-atom-quiz');
                if ($quiz.length > 0) {
                    bean.on(document, 'click', Array.prototype.slice.call($quiz), function (e) {
                        var quiz = e.currentTarget;
                        if (quiz.checkValidity()) {
                            var $bucket__message = null,
                                bucket = $(':checked + .atom-quiz__answer__item--is-correct', quiz).length;
                            do {
                                $bucket__message = $('.js-atom-quiz__bucket-message--' + bucket, quiz);
                                if ($bucket__message.length > 0) {
                                    fastdom.write(function () {
                                        $bucket__message.css({
                                            'display': 'block'
                                        });
                                    });
                                    break;
                                }
                                bucket--;
                            } while (bucket >= 0);
                        }
                    })
                }
            }
        }
    }
})
