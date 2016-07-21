define([
    'common/utils/fastdom-promise',
    'common/utils/$'
], function (
    fastdomPromise,
    $
) {
    var mainMenuId = '#main-menu';
    var html = $('html');
    var mainMenuEl = $(mainMenuId);
    var burgerMenu = $('.js-animate-menu');
    var burgerLink = $('.js-change-link');

    function animateMenuOpen() {
        return fastdomPromise.write(function () {
            mainMenuEl.addClass('off-screen shown');

            burgerMenu.addClass('new-header__burger-icon--open');
            burgerLink.attr('href', '#');
        }).then(function () {
            return fastdomPromise.write(function () {
                mainMenuEl.removeClass('off-screen');
            });
        }).then(function () {
            var firstButton = $('.main-navigation__item__button')[0];

            return fastdomPromise.write(function () {
                if (firstButton) {
                    firstButton.focus();
                }
                // Prevents scrolling on the body
                html.css('overflow', 'hidden');
            });
        });
    }

    function animateMenuClose() {
        return fastdomPromise.write(function () {
            if (mainMenuEl.hasClass('shown')) {
                mainMenuEl.addClass('off-screen');

                burgerMenu.removeClass('new-header__burger-icon--open');
                burgerLink.attr('href', mainMenuId);

                // TODO: Support browsers that don't have transitions
                // We still want to hide this
                if (mainMenuEl.length > 0) {

                    mainMenuEl[0].addEventListener('transitionend', function handler() {

                        mainMenuEl[0].removeEventListener('transitionend', handler);

                        return fastdomPromise.write(function () {
                            mainMenuEl.removeClass('off-screen');
                            mainMenuEl.removeClass('shown');
                        }).then(function () {
                            return fastdomPromise.write(function () {
                                $('.new-header__nav__menu-button').focus();
                                // Users should be able to scroll again
                                html.css('overflow', '');
                            });
                        });
                    });
                }
            }
        });
    }

    function handleHashChange () {
        var shouldShowMenu = window.location.hash === mainMenuId;
        var shouldHideMenu = window.location.hash === '';

        if (shouldShowMenu) {
            animateMenuOpen();
        } else if (shouldHideMenu) {
            animateMenuClose();
        }
    }

    function init() {
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
    }

    return init;
});
