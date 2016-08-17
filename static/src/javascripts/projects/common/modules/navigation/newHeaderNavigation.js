define([
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/modules/navigation/edition-picker',
    'common/modules/navigation/editionalise-menu'
], function (
    fastdomPromise,
    $,
    editionPicker,
    editionaliseMenu
) {
    var mainMenuId = '#main-menu';
    var html = $('html');
    var mainMenuEl = $(mainMenuId);
    var veggieBurgerLink = $('.js-change-link');
    var veggieBurgerIcon = $('.js-animate-menu');
    var primaryItems = $('.js-close-nav-list');

    function closeAllOtherPrimaryLists(targetItem) {
        primaryItems.each(function (item) {

            if (item !== targetItem) {
                item.removeAttribute('open');
            }
        });
    }

    function animateMenuOpen() {
        return fastdomPromise.write(function () {
            mainMenuEl.addClass('off-screen shown');

            veggieBurgerIcon.addClass('new-header__veggie-burger-icon--open');
            veggieBurgerLink.attr('href', '#');
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

                veggieBurgerIcon.removeClass('new-header__veggie-burger-icon--open');
                veggieBurgerLink.attr('href', mainMenuId);

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
                                var mainListItems = $('.main-navigation__item');
                                // Remove possible ordering for the lists
                                mainListItems.removeAttr('style');
                                // No targetItem to put in as the parameter. All lists should close.
                                closeAllOtherPrimaryLists();

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

    function moveTargetListToTop(targetListId) {
        primaryItems.each(function (listItem, index) {

            fastdomPromise.read(function () {
                return listItem.getAttribute('id');
            }).then(function (itemId) {

                if (itemId === targetListId) {
                    fastdomPromise.write(function () {
                        var parent = listItem.parentNode;
                        var menuContainer = $('.js-reset-scroll-on-menu');

                        // Using flexbox to reorder lists based on what is clicked.
                        parent.style.order = '-' + index;

                        // Make sure when the menu is open, the user is always scrolled to the top
                        menuContainer[0].scrollTop = 0;
                    });
                }
            });
        });
    }

    function openTargetListOnClick() {
        var primaryLinks = $('.js-open-section-in-menu');

        primaryLinks.each(function (primaryLink) {

            primaryLink.addEventListener('click', function () {

                fastdomPromise.read(function () {
                    return primaryLink.getAttribute('aria-controls');
                }).then(function (id) {
                    var menuToOpen = $('#' + id);

                       fastdomPromise.write(function () {
                        menuToOpen.attr('open', '');
                        return id;
                    }).then(moveTargetListToTop.bind(id));
                });
            });
        });
    }

    function bindPrimaryItemClickEvents() {
        primaryItems.each(function (item) {

            item.addEventListener('click', closeAllOtherPrimaryLists.bind(null, item));
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

        bindPrimaryItemClickEvents();
        openTargetListOnClick();

        editionPicker();
        editionaliseMenu();
    }

    return init;
});
