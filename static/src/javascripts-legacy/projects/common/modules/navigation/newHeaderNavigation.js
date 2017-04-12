define([
    'qwery',
    'fastdom',
    'ophan/ng',
    'common/modules/navigation/user-account'
], function (
    qwery,
    fastdom,
    ophan,
    userAccount
) {
    var html = qwery('html')[0];
    var menuItems = qwery('.js-close-nav-list');
    var enhanced = {};

    function weShouldEnhance(checkbox) {
        return !enhanced[checkbox.id] && checkbox && !checkbox.checked;
    }

    function applyEnhancementsTo(checkbox) {
        fastdom.read(function () {
            var button = document.createElement('button');
            var checkboxId = checkbox.id;
            var checkboxControls = checkbox.getAttribute('aria-controls');
            var checkboxClasses = Array.prototype.slice.call(checkbox.classList);

            checkboxClasses.forEach(function (c) {
                button.classList.add(c);
            });
            button.setAttribute('id', checkboxId);
            button.setAttribute('aria-controls', checkboxControls);
            button.setAttribute('aria-expanded', 'false');

            fastdom.write(function () {
                var eventHandler = veggieBurgerClickHandler;

                checkbox.parentNode.replaceChild(button, checkbox);
                if (eventHandler) {
                    button.addEventListener('click', eventHandler);
                }
                enhanced[button.id] = true;
            });
        });
    }

    function closeAllOtherPrimaryLists(targetItem) {
        menuItems.forEach(function (item) {
            if (item !== targetItem) {
                item.removeAttribute('open');
            }
        });
    }

    function removeOrderingFromLists() {
        var mainListItems = qwery('.js-navigation-item');

        mainListItems.forEach(function (item) {
            item.style.order = '';
        });
    }

    function enhanceCheckboxesToButtons() {
        var checkbox = document.getElementById('main-menu-toggle');

        if (!checkbox) {
            return;
        }

        if (weShouldEnhance(checkbox)) {

            applyEnhancementsTo(checkbox);
        } else {
            checkbox.addEventListener('click', function closeMenuHandler() {

                applyEnhancementsTo(checkbox);
                checkbox.removeEventListener('click', closeMenuHandler);
            });

            ophan.record({
                component: 'main-navigation',
                value: 'is fully expanded'
            });
        }
    }

    function veggieBurgerClickHandler(event) {
        var button = event.target;
        var mainMenu = document.getElementById('main-menu');
        var veggieBurgerLink = qwery('.js-change-link')[0];

        function menuIsOpen() {
            return button.getAttribute('aria-expanded') === 'true';
        }

        if (!mainMenu || !veggieBurgerLink) {
            return;
        }
        if (menuIsOpen()) {
            fastdom.write(function () {
                button.setAttribute('aria-expanded', 'false');
                mainMenu.setAttribute('aria-hidden', 'true');
                veggieBurgerLink.classList.remove('new-header__nav__menu-button--open');
                veggieBurgerLink.setAttribute('data-link-name', 'nav2 : veggie-burger : show');
                removeOrderingFromLists();

                // Users should be able to scroll again
                html.classList.remove('nav-is-open');
            });
        } else {
            fastdom.write(function () {
                var firstButton = qwery('.js-navigation-button')[0];

                button.setAttribute('aria-expanded', 'true');
                mainMenu.setAttribute('aria-hidden', 'false');
                veggieBurgerLink.classList.add('new-header__nav__menu-button--open');
                veggieBurgerLink.setAttribute('data-link-name', 'nav2 : veggie-burger : hide');

                if (firstButton) {
                    firstButton.focus();
                }
                // No targetItem to put in as the parameter. All lists should close.
                closeAllOtherPrimaryLists();
                // Prevents scrolling on the body
                html.classList.add('nav-is-open');
            });
        }
    }

    function bindMenuItemClickEvents() {
        menuItems.forEach(function (item) {
            item.addEventListener('click', closeAllOtherPrimaryLists.bind(null, item));
        });
    }

    function init() {
        enhanceCheckboxesToButtons();
        bindMenuItemClickEvents();
        userAccount();
    }

    return init;
});
