define([
    'qwery',
    'common/$',
    'bean'
], function (
    qwery,
    $,
    bean
) {
    var NewNavigation = {
        init: function(){
            // toggle mega nav
            qwery('.js-new-navigation-toggle').forEach(function(elem) {
                bean.on(elem, 'click touchstart', function (e) {
                    e.preventDefault();
                    if ($('.new-navigation--expanded').length > 0) {
                        $('.new-navigation').removeClass('new-navigation--expanded')
                                            .addClass('new-navigation--collapsed');
                    } else {
                        $('.new-navigation').addClass('new-navigation--expanded')
                                            .removeClass('new-navigation--collapsed');
                    }
                });
            });
        }
    };

    return NewNavigation;
});
