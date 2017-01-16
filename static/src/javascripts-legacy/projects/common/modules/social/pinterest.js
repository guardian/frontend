define([
    'fastdom',
    'bean',
    'common/utils/$',
    'common/utils/load-script'
], function (
    fastdom,
    bean,
    $,
    loadScript
) {
    var buttonsSelector = '.social__item--pinterest',
        buttons;

    function launchOverlay(event) {
        event.preventDefault();

        $('img:not(.gu-image):not(.responsive-img):not(.gallery2__img)').each(function (img) {
            fastdom.write(function () {
                $(img).attr('data-pin-nopin', 'true');
            });
        });

        loadScript(['https://assets.pinterest.com/js/pinmarklet.js?r=' + new Date().getTime()]);
    }

    return function () {
        buttons = buttons || $(buttonsSelector);
        buttons.each(function (el) {
            bean.on(el, 'click', launchOverlay);
        });
    };
});
