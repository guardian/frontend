define([
    'bean',
    'common/utils/$'
], function (
    bean,
    $
) {
    function init() {
        var $subscriberNumberForm = $('.js-subscriber-number-form')[0];

        if (!$subscriberNumberForm) {
            return;
        }

        bean.on($subscriberNumberForm, 'submit', submitForm($subscriberNumberForm));
    }

    function submitForm($form) {
        return function (event) {
            var $numberInput = $('.input-number', $form),
                numberVal = $numberInput.val(),
                subscriber = /^(?=\d{8}$)(00)\d+/.test(numberVal), //8 digit number starting with 00
                $correctNumberInfo = $('.js-subscriber-number-correct'),
                $incorrectNumberInfo = $('.js-subscriber-number-incorrect');

            event.preventDefault();

            if (subscriber) {
                $correctNumberInfo.removeClass('u-h');
                $incorrectNumberInfo.addClass('u-h');
                $numberInput.addClass('correct');
                $numberInput.removeClass('incorrect');
            } else {
                $incorrectNumberInfo.removeClass('u-h');
                $correctNumberInfo.addClass('u-h');
                $numberInput.addClass('incorrect');
                $numberInput.removeClass('correct');
            }
        };
    }

    return {
        init: init
    };

});
