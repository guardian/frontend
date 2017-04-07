// @flow

import qwery from 'qwery';
import fastdom from 'fastdom';
import ophan from 'ophan/ng';
import userAccount from 'common/modules/navigation/user-account';

const html = qwery('html')[0];
const menuItems = qwery('.js-close-nav-list');
const enhanced = {};

const weShouldEnhance = (checkbox: HTMLInputElement): ?boolean =>
    !enhanced[checkbox.id] && checkbox && !checkbox.checked;

const closeAllOtherPrimaryLists = (targetItem?: HTMLElement): void => {
    menuItems.forEach(item => {
        if (item !== targetItem) {
            item.removeAttribute('open');
        }
    });
};

const removeOrderingFromLists = (): void => {
    const mainListItems = qwery('.js-navigation-item');

    mainListItems.forEach(item => {
        const listItem = item;

        listItem.style.order = '';
    });
};

const toggleSidebar = (event: Event): void => {
    // #? hacky type cast
    const button: HTMLElement = (event.target: any);
    const mainMenu = document.getElementById('main-menu');
    const veggieBurgerLink = qwery('.js-change-link')[0];

    const menuIsOpen = (): boolean =>
        button.getAttribute('aria-expanded') === 'true';

    if (!mainMenu || !veggieBurgerLink) {
        return;
    }
    if (menuIsOpen()) {
        fastdom.write(() => {
            button.setAttribute('aria-expanded', 'false');
            mainMenu.setAttribute('aria-hidden', 'true');
            veggieBurgerLink.classList.remove(
                'new-header__nav__menu-button--open'
            );
            veggieBurgerLink.setAttribute(
                'data-link-name',
                'nav2 : veggie-burger : show'
            );
            removeOrderingFromLists();

            // Users should be able to scroll again
            html.classList.remove('nav-is-open');
        });
    } else {
        fastdom.write(() => {
            const firstButton = qwery('.js-navigation-button')[0];

            button.setAttribute('aria-expanded', 'true');
            mainMenu.setAttribute('aria-hidden', 'false');
            veggieBurgerLink.classList.add(
                'new-header__nav__menu-button--open'
            );
            veggieBurgerLink.setAttribute(
                'data-link-name',
                'nav2 : veggie-burger : hide'
            );

            if (firstButton) {
                firstButton.focus();
            }
            // No targetItem to put in as the parameter. All lists should close.
            closeAllOtherPrimaryLists();
            // Prevents scrolling on the body
            html.classList.add('nav-is-open');
        });
    }
};

const applyEnhancementsTo = (checkbox: HTMLElement): void => {
    fastdom.read(() => {
        const button = document.createElement('button');
        const checkboxId = checkbox.id;
        const checkboxControls = checkbox.getAttribute('aria-controls');
        const checkboxClasses = Array.prototype.slice.call(checkbox.classList);

        checkboxClasses.forEach(c => {
            button.classList.add(c);
        });

        button.setAttribute('id', checkboxId);

        if (checkboxControls) {
            button.setAttribute('aria-controls', checkboxControls);
        }

        button.setAttribute('aria-expanded', 'false');

        fastdom.write(() => {
            if (checkbox.parentNode) {
                checkbox.parentNode.replaceChild(button, checkbox);
            }

            button.addEventListener('click', toggleSidebar);
            enhanced[button.id] = true;
        });
    });
};

const enhanceCheckboxesToButtons = (): void => {
    const checkbox = document.getElementById('main-menu-toggle');

    if (!checkbox || !(checkbox instanceof HTMLInputElement)) {
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
            value: 'is fully expanded',
        });
    }
};

const bindMenuItemClickEvents = (): void => {
    menuItems.forEach(item =>
        item.addEventListener(
            'click',
            closeAllOtherPrimaryLists.bind(null, item)
        ));
};

const init = (): void => {
    enhanceCheckboxesToButtons();
    bindMenuItemClickEvents();
    userAccount();
};

export default init;
