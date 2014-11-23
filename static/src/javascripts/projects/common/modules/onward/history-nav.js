define([
    'bean',
    'bonzo',
    'common/utils/_',
    'common/modules/onward/history',
    'common/utils/template'
], function (
    bean,
    bonzo,
    _,
    history,
    template
) {
    function init() {
        var container = document.querySelector('.js-history-nav-placeholder'),
            popular = history.getPopular();

        if (container && popular) {
            bonzo(container).html(
                '<ul class="local-navigation">' +
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
