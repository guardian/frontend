define([
    'common/$',
    'bean'
], function (
    $,
    bean
) {
    var NewNav = {
        init: function(){
            // hide hamburger menu
            $('.control--sections').hide();
            $('.top-nav__item--mobile-only').hide();

            // toggle mega nav
            bean.on(document.querySelector('.navigation-toggle__action'), 'click touchstart', function () {
                window.console.log('click!');
                $('.new-navigation').toggleClass('new-navigation--expanded');
            });
        }
    };

    return NewNav;
});
