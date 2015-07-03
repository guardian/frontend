define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/$'
], function (
    bean,
    bonzo,
    fastdom,
    $
) {
    var overlaySelector = '.u-faux-block-link__overlay',
        hoverStateClassName = 'u-faux-block-link--hover';

    return function () {
        bean.on(document.body, 'mouseenter', overlaySelector, function (e) {
            fastdom.write(function () {
                $(e.currentTarget).parent().addClass(hoverStateClassName);
            });
        });
        bean.on(document.body, 'mouseleave', overlaySelector, function (e) {
            fastdom.write(function () {
                $(e.currentTarget).parent().removeClass(hoverStateClassName);
            });
        });
    };
});
