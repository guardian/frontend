define([
    'qwery',
    'common/$',
    'bean'
], function (
    qwery,
    $,
    bean
) {
    var NewNav = {
        init: function(){
            // toggle mega nav
            qwery('.navigation-toggle__action').forEach(function(elem){
                bean.on(elem, 'click touchstart', function () {
                    $('.new-navigation').toggleClass('new-navigation--expanded');
                });
            });
        }
    };

    return NewNav;
});
