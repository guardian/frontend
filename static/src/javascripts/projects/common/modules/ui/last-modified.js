define([
    'bean',
    'qwery',
    'common/utils/$'
], function (
    bean,
    qwery,
    $
) {
    function expand() {
        $('.js-lm').toggleClass('u-h');
    }

    function init() {
        if ($('.js-lm').length) {
            $('.js-wpd').addClass('content__dateline-wpd--modified tone-colour');
            bean.on(qwery('.js-wpd')[0], 'click', expand);
        }
    }

    return {
        init: init
    };
});
