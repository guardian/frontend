define([
    'bean',
    'fastdom',
    'qwery',
    'common/utils/$'
], function (
    bean,
    fastdom,
    qwery,
    $
) {
    return function () {
        var $jsLm = $('.js-lm');

        if ($jsLm) {
            fastdom.write(function () {
                $('.js-wpd').addClass('content__dateline-wpd--modified tone-colour');
            });

            bean.on(qwery('.js-wpd')[0], 'click', function () {
                fastdom.write(function () {
                    $jsLm.toggleClass('u-h');
                });
            });
        }
    };
});
