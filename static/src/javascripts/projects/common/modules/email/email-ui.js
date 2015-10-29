define([
    'bean',
    'qwery',
    'common/utils/$'
], function (
    bean,
    qwery,
    $
) {
    return {
        init: function () {
            $('.js-email-sub__inline-label').each(function(el){
                var $el = $(el),
                    $input = $('.js-email-sub__text-input', el),
                    $label = $('.js-email-sub__label', el);

                $el.addClass('email-sub__inline-label--enabled');

                bean.on($input[0], 'focus blur', function(){
                    if ($input.val() === '') {
                        $label.toggleClass('email-sub__label--is-hidden');
                    }
                });
            });
        }
    }
});
