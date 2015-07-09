define([
    'fastdom',
    'bean',
    'common/utils/$'
], function (
    fastdom,
    bean,
    $
) {
    function launchOverlay(event) {
        event.preventDefault();

        $('img:not(.gu-image):not(.responsive-img)').each(function (img) {
            fastdom.write(function () {
                $(img).attr('data-pin-nopin', 'true');
            });
        });

        require(['js!https://assets.pinterest.com/js/pinmarklet.js?r=' + new Date().getTime()]);
    }

    return function () {
        $('.social__item--pinterest').each(function (el) {
            fastdom.write(function () {
                $(el).css('display', 'block');
            });

            bean.on(el, 'click', launchOverlay);
        });
    };
});
