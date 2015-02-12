define([
    'bean',
    'common/utils/$',
], function (
    bean,
    $
) {
    function expand() {
        $('.js-lm').toggleClass('u-h');
    };

    function init() {
        if($('.js-lm').length != 0) {
            $('.js-wpd').addClass('content__dateline-wpd--modified tone-colour');
            bean.on(document.body, 'click', '.js-wpd', expand);
        }
    };

    return {
        init: init
    };
});
