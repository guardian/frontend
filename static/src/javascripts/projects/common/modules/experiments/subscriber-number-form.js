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
        console.log('submit');

        return function(event) {
            var numberVal = $('.input-number', $form).val();


            event.preventDefault();
            console.log(numberVal);
        };
    }

    return {
        init: init
    };

});
