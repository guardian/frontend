define([
    'bean',
    'common/utils/$',
    'common/utils/storage'
], function (
    bean,
    $,
    storage
) {
    function init() {
        var $subscriberNumberForm = $('.js-subscriber-number-form')[0];

        if (!$subscriberNumberForm) {
            return;
        }

        bean.on($subscriberNumberForm, 'submit', submitForm($subscriberNumberForm));
    }

    function correctNumber($numberInput, $correctNumberInfo, $incorrectNumberInfo) {
        storage.local.set('gu.subscriber', true);
        $correctNumberInfo.removeClass('u-h');
        $incorrectNumberInfo.addClass('u-h');
        $numberInput.addClass('correct');
        $numberInput.removeClass('incorrect');
    }

    function incorrectNumber($numberInput, $correctNumberInfo, $incorrectNumberInfo) {
        storage.local.set('gu.subscriber', false);
        $incorrectNumberInfo.removeClass('u-h');
        $correctNumberInfo.addClass('u-h');
        $numberInput.addClass('incorrect');
        $numberInput.removeClass('correct');
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
                correctNumber($numberInput, $correctNumberInfo, $incorrectNumberInfo);
            } else {
                incorrectNumber($numberInput, $correctNumberInfo, $incorrectNumberInfo);
            }
        };
    }

    return {
        init: init
    };

});
