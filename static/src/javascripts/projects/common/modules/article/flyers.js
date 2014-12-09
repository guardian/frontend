define([
    'qwery',
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax'
], function (
    qwery,
    _,
    $,
    ajax
) {
    function upgradeFlyer(el) {
        var href = $('a', el).attr('href'),
            matches = href.match(/(?:https?:\/\/www\.theguardian\.com)?(\/.*)/);

        if (matches && matches[1]) {
            ajax({
                url: '/embed/card' + matches[1] + '.json',
                crossOrigin: true
            }).then(function (response) {
                $(el).html(response.html)
                    .addClass('element-rich-link--upgraded');
            });
        }
    }

    function init() {
        $('.js-article__body .element-rich-link').each(upgradeFlyer);
    }

    return {
        init: init,
        upgradeFlyer: upgradeFlyer
    };
});
