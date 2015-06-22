define([
    'bean',
    'qwery',
    'common/utils/$'
], function (
    bean,
    qwery,
    $
) {
    return function () {
        var $jsLm = $('.js-lm');

        if ($jsLm) {
            $('.js-wpd').addClass('content__dateline-wpd--modified tone-colour');
            bean.on(qwery('.js-wpd')[0], 'click', function () {
                $jsLm.toggleClass('u-h');
            });
        }
    };
});
