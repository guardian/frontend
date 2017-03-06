define([
    'bean',
    'fastdom',
    'qwery',
    'lib/$'
], function (
    bean,
    fastdom,
    qwery,
    $
) {
    return function () {
        var $jsLm = $('.js-lm');

        if ($jsLm.length > 0) {
            fastdom.write(function () {
                $('.js-wpd').addClass('content__dateline-wpd--modified');
            });

            bean.on(qwery('.js-wpd')[0], 'click', function () {
                fastdom.write(function () {
                    $jsLm.toggleClass('u-h');
                });
            });
        }
    };
});
