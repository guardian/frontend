define([
    'bean',
    'qwery',
    'common/utils/$'
], function (
    bean,
    qwery,
    $
) {
    var Navigation = {
        init: function () {
            this.addMegaNavMenu();
            this.enableMegaNavToggle();
            this.replaceAllSectionsLink();
        },

        addMegaNavMenu: function () {
            var megaNav     = $('.js-transfuse'),
                placeholder = $('.' + megaNav.attr('data-transfuse-target'));
            placeholder.html(megaNav.html());
        },

        replaceAllSectionsLink: function () {
            $('.js-navigation-header .js-navigation-toggle').attr('href', '#nav-allsections');
        },

        enableMegaNavToggle: function () {
            bean.on(document, 'click', '.js-navigation-toggle', function (e) {
                e.preventDefault();
                $('.' + e.currentTarget.getAttribute('data-target-nav')).toggleClass('navigation--expanded navigation--collapsed');
            });
        }
    };

    return Navigation;
});
