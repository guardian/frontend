define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/onward/history'
], function (
    $,
    _,
    storage,
    template,
    history
    ) {

    var storageKeyHistoryNav = 'gu.history.nav';

    function stripOuterSlashes(path) {
        return (path || '').replace(/^\/|\/$/g, '');
    }

    function collapseTag(t) {
        t = t.replace(/^(uk|us|au)\//, '');
        t = t.split('/');
        t = t.length === 2 && t[0] === t[1] ? [t[0]] : t;
        return t.join('/');
    }

    function init() {
        var popular = history.getPopular(),
            topNav,
            topNavItems,
            topNavItemIds = [],
            myNav = [];

        if (popular.length) {
            topNav =  document.querySelector('.js-top-navigation');

            topNavItems = $('.top-navigation__item', topNav);

            topNavItemIds = topNavItems.map(function (item) {
                return collapseTag(stripOuterSlashes($('a', item).attr('href')));
            });

            _.chain(popular)
                .reverse()
                .forEach(function (tag) {
                    var pos = topNavItemIds.indexOf(tag[0]);

                    if (pos > -1) {
                        $(topNavItems[pos]).detach().insertAfter(topNavItems[0]);
                    } else {
                        myNav.unshift(tag);
                    }
                });

            storage.local.set(storageKeyHistoryNav, topNav.innerHTML.replace(/\s{2,}/g, ' ').replace('\\"', ''));

            if (myNav.length) {
                $('.js-history-nav-placeholder').html(
                    '<ul class="signposting">' +
                        '<li class="signposting__item signposting__item--home">' +
                            '<a class="signposting__action" href="/" data-link-name="nav : signposting : jump to">jump to</a>' +
                        '</li>' +
                    '</ul>' +
                    '<ul class="local-navigation">' +
                        myNav.map(function (tag) {
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
    }

    return {
        init: init
    };
});
