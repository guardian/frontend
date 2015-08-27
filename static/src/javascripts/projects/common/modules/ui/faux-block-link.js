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

        // mouseover
        bean.on(document.body, 'mouseenter', overlaySelector, showIntentToClick);
        // mouseout
        bean.on(document.body, 'mouseleave', overlaySelector, removeIntentToClick);
    };
});
