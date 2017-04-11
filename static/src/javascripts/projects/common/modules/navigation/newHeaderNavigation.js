// @flow

import fastdom from 'fastdom';
import ophan from 'ophan/ng';
import userAccount from 'common/modules/navigation/user-account';

const html = document.documentElement;
const menuItems = [...document.querySelectorAll('.js-close-nav-list')];
const enhanced = {};

const weShouldEnhance = (checkbox: HTMLInputElement): ?boolean =>
    checkbox && !enhanced[checkbox.id] && !checkbox.checked;

const closeAllSidebarBlocksExcept = (targetItem?: HTMLElement): void => {
    menuItems.forEach(item => {
        if (item !== targetItem) {
            item.removeAttribute('open');
        }
    });
};

const removeOrderingFromLists = (): void => {
    const mainListItems = [...document.querySelectorAll('.js-navigation-item')];

    mainListItems.forEach(item => {
        const listItem = item;
        listItem.style.order = '';
    });
};

const toggleSidebar = (trigger: HTMLElement): void => {
    const openClass = 'new-header__nav__menu-button--open';
    const globalOpenClass = 'nav-is-open';

    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    const mainMenu = document.getElementById('main-menu');
    const veggieBurgerLink = document.querySelector('.js-change-link');

    if (!mainMenu || !veggieBurgerLink) {
        return;
    }

    const update = () => {
        const expandedAttr = isOpen ? 'false' : 'true';
        const hiddenAttr = isOpen ? 'true' : 'false';
        const linkState = isOpen ? 'show' : 'hide';

        veggieBurgerLink.setAttribute(
            'data-link-name',
            `nav2 : veggie-burger : ${linkState}`
        );

        trigger.setAttribute('aria-expanded', expandedAttr);
        mainMenu.setAttribute('aria-hidden', hiddenAttr);
        veggieBurgerLink.classList.toggle(openClass, !isOpen);

        if (html) {
            html.classList.toggle(globalOpenClass, !isOpen);
        }

        if (isOpen) {
            removeOrderingFromLists();
        } else {
            const navButton = document.querySelector('.js-navigation-button');

            if (navButton) {
                navButton.focus();
            }

            closeAllSidebarBlocksExcept();
        }
    };

    fastdom.write(update);
};

const applyEnhancementsTo = (checkbox: HTMLElement): void => {
    fastdom.read(() => {
        const button = document.createElement('button');
        const checkboxId = checkbox.id;
        const checkboxControls = checkbox.getAttribute('aria-controls');

        fastdom.write(() => {
            [...checkbox.classList].forEach(c => button.classList.add(c));

            button.setAttribute('id', checkboxId);

            if (checkboxControls) {
                button.setAttribute('aria-controls', checkboxControls);
            }

            button.setAttribute('aria-expanded', 'false');

            if (checkbox.parentNode) {
                checkbox.parentNode.replaceChild(button, checkbox);
            }

            button.addEventListener('click', (event: Event) => {
                // #? hacky type cast
                const target: HTMLElement = (event.target: any);
                toggleSidebar(target);
            });

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
            closeAllSidebarBlocksExcept.bind(null, item)
        ));
};

const init = (): void => {
    enhanceCheckboxesToButtons();
    bindMenuItemClickEvents();
    userAccount();
};

export default init;
