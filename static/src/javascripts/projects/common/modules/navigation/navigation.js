define([
    'bean',
    'qwery',
    'common/utils/mediator',
    'common/utils/$'
], function (
    bean,
    qwery,
    mediator,
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
                var target = $('.' + e.currentTarget.getAttribute('data-target-nav'));

                e.preventDefault();
                target.toggleClass('navigation--expanded navigation--collapsed');
                mediator.emit(target.hasClass('navigation--expanded') ? 'modules:nav:open' : 'modules:nav:close');
            });
        }
    };

    return Navigation;
});
