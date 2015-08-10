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
        var showIntentToClick = function (e) {
            fastdom.write(function () {
                $(e.currentTarget).parent().addClass(hoverStateClassName);
            });
        };
        var removeIntentToClick = function (e) {
            fastdom.write(function () {
                $(e.currentTarget).parent().removeClass(hoverStateClassName);
            });
        };

        bean.on(document.body, 'touchstart', overlaySelector, showIntentToClick);
        bean.on(document.body, 'touchend', overlaySelector, removeIntentToClick);
        bean.on(document.body, 'mouseenter', overlaySelector, showIntentToClick);
        bean.on(document.body, 'mouseleave', overlaySelector, removeIntentToClick);
    };
});
