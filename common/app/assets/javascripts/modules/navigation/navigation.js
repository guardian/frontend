define([
    'qwery',
    'bean',
    'common/utils/$'
], function (
    qwery,
    bean,
    $
) {
    var Navigation = {
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
            bean.on(document, 'click', '.js-navigation-toggle', function (e) {
                e.preventDefault();
                $('.' + e.currentTarget.getAttribute('data-target-nav')).toggleClass('navigation--expanded navigation--collapsed');
            });
        }
    };

    return Navigation;
});
