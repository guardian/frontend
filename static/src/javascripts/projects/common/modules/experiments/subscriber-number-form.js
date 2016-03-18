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
        var $form = $('.js-subscriber-number-form')[0];

        if (!$form) {
            return;
        }

        bean.on($form, 'submit', function (event) {
            submitForm($form, event);
        });
    }

    function onCorrectNumber($numberInput, $correctNumberInfo, $incorrectNumberInfo) {
        storage.local.set('gu.subscriber', true);
        $correctNumberInfo.removeClass('u-h');
        $incorrectNumberInfo.addClass('u-h');
        $numberInput.addClass('correct');
        $numberInput.removeClass('incorrect');
    }

    function onIncorrectNumber($numberInput, $correctNumberInfo, $incorrectNumberInfo) {
        storage.local.set('gu.subscriber', false);
        $incorrectNumberInfo.removeClass('u-h');
        $correctNumberInfo.addClass('u-h');
        $numberInput.addClass('incorrect');
        $numberInput.removeClass('correct');
    }

    function submitForm($form, event) {
        event.preventDefault();

        var $numberInput = $('.input-number', $form),
            numberVal = $numberInput.val(),
            isSubscriber = /^(?=\S{8,11}$)(00|GA|A-S)\S+/.test(numberVal), //8-11 characters starting with either 00, GA or A-S
            $correctNumberInfo = $('.js-subscriber-number-correct'),
            $incorrectNumberInfo = $('.js-subscriber-number-incorrect');

        if (isSubscriber) {
            onCorrectNumber($numberInput, $correctNumberInfo, $incorrectNumberInfo);
        } else {
            onIncorrectNumber($numberInput, $correctNumberInfo, $incorrectNumberInfo);
        }
    }

    return function () {
        init();
    };

});
