// @flow

import fastdom from 'fastdom';
import ophan from 'ophan/ng';
import userAccount from 'common/modules/navigation/user-account';

const html = document.documentElement;
const sidebarSections = [...document.querySelectorAll('.js-close-nav-list')];
const sidebar = document.getElementById('main-menu');
const sidebarToggle = document.querySelector('.js-change-link');
const enhanced = {};

const weShouldEnhance = (checkbox: HTMLInputElement): ?boolean =>
    checkbox && !enhanced[checkbox.id] && !checkbox.checked;

const closeAllSidebarBlocksExcept = (targetItem?: HTMLElement): void => {
    sidebarSections.forEach(item => {
        if (item !== targetItem) {
            item.removeAttribute('open');
        }
    });
};

const toggleSidebar = (trigger: HTMLElement): void => {
    const openClass = 'new-header__nav__menu-button--open';
    const globalOpenClass = 'nav-is-open';
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    if (!sidebar || !sidebarToggle) {
        return;
    }

    const resetItemOrder = (): void => {
        const items = [...document.querySelectorAll('.js-navigation-item')];

        items.forEach(item => {
            const listItem = item;
            listItem.style.order = '';
        });
    };

    const focusFirstSection = (): void => {
        const firstSection = document.querySelector('.js-navigation-button');

        if (firstSection) {
            firstSection.focus();
        }
    };

    const update = () => {
        const expandedAttr = isOpen ? 'false' : 'true';
        const hiddenAttr = isOpen ? 'true' : 'false';
        const linkState = isOpen ? 'show' : 'hide';

        sidebarToggle.setAttribute(
            'data-link-name',
            `nav2 : veggie-burger : ${linkState}`
        );

        trigger.setAttribute('aria-expanded', expandedAttr);
        sidebar.setAttribute('aria-hidden', hiddenAttr);
        sidebarToggle.classList.toggle(openClass, !isOpen);

        if (html) {
            html.classList.toggle(globalOpenClass, !isOpen);
        }

        if (isOpen) {
            resetItemOrder();
        } else {
            focusFirstSection();
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

const addEventHandler = (): void => {
    sidebarSections.forEach(item =>
        item.addEventListener(
            'click',
            closeAllSidebarBlocksExcept.bind(null, item)
        ));
};

const init = (): void => {
    enhanceCheckboxesToButtons();
    addEventHandler();
    userAccount();
};

export default init;
