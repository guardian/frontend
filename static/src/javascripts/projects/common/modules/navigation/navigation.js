define([
    'bean',
    'qwery',
    'fastdom',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/$'
], function (
    bean,
    qwery,
    fastdom,
    mediator,
    detect,
    $
) {
    var Navigation = {
        init: function () {
            this.addMegaNavMenu();
            this.enableMegaNavToggle();
            this.replaceAllSectionsLink();

            if (detect.isIOS() && detect.getUserAgent.version > 5) {
                // crashed mobile safari < 6, so we add it here after detection
                $('.navigation__scroll').css({'-webkit-overflow-scrolling': 'touch'});
            }
        },

        addMegaNavMenu: function () {
            var megaNav     = $('.js-transfuse'),
                placeholder = $('.' + megaNav.attr('data-transfuse-target'));

            fastdom.write(function () {
                placeholder.html(megaNav.html());
            });
        },

        replaceAllSectionsLink: function () {
            $('.js-navigation-header .js-navigation-toggle').attr('href', '#nav-allsections');
        },

        enableMegaNavToggle: function () {
            bean.on(document, 'click', '.js-navigation-toggle', function (e) {
                var target = $('.' + e.currentTarget.getAttribute('data-target-nav'));

                e.preventDefault();
                fastdom.write(function () {
                    target.toggleClass('navigation--expanded navigation--collapsed');
                    mediator.emit(target.hasClass('navigation--expanded') ? 'modules:nav:open' : 'modules:nav:close');
                });
            });
        }
    };

    return Navigation;
});
