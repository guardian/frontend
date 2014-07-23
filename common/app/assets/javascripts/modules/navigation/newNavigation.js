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
            qwery('.js-navigation-toggle').forEach(function(elem) {
                bean.on(elem, 'click touchstart', function (e) {
                    e.preventDefault();
                    if (qwery('.navigation--expanded').length > 0) {
                        $('.navigation')
                            .removeClass('navigation--expanded')
                            .addClass('navigation--collapsed');
                    } else {
                        $('.navigation')
                            .addClass('navigation--expanded')
                            .removeClass('navigation--collapsed');
                    }
                });
            });
        }
    };

    return NewNavigation;
});
