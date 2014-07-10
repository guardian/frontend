define([
    'qwery',
    'bean',
    'common/utils/$'
], function (
    qwery,
    bean,
    $
) {
    var NewNavigation = {
        init: function(){
            this.addMegaNavMenu();
            this.enableMegaNavToggle();
        },

        addMegaNavMenu: function(){
            var megaNav = $('.js-transfuse');
            var placeholder = $('.'+megaNav.attr('data-transfuse-target'));
            placeholder.html(megaNav.html());
        },

        enableMegaNavToggle: function(){
            qwery('.js-new-navigation-toggle').forEach(function(elem) {
                bean.on(elem, 'click touchstart', function (e) {
                    e.preventDefault();
                    if (qwery('.new-navigation--expanded').length > 0) {
                        $('.new-navigation')
                            .removeClass('new-navigation--expanded')
                            .addClass('new-navigation--collapsed');
                    } else {
                        $('.new-navigation')
                            .addClass('new-navigation--expanded')
                            .removeClass('new-navigation--collapsed');
                    }
                });
            });
        }
    };

    return NewNavigation;
});
