define([
    'common/utils/$',
    'common/utils/_',
    'common/modules/onward/history',
    'common/utils/template'
], function (
    $,
    _,
    history,
    template
) {
    function init() {
        var popular = history.getPopular();

        if (popular.length) {
            $('.js-history-nav-placeholder').html(
                '<ul class="history-nav">' +
                    popular.map(function (tag) {
                        return template(
                            '<li class="local-navigation__item">' +
                                '<a href="/{{id}}" class="local-navigation__action" data-link-name="nav : history : {{name}}">{{name}}</a>' +
                            '</li>',
                            {id: tag[0], name: tag[1]}
                        );
                    }).join('') +
                '</ul>'
            );
        }
    }

    return {
        init: init
    };
});
