// @flow

import fastdom from 'fastdom';
import ophan from 'ophan/ng';
import userAccount from 'common/modules/navigation/user-account';

const sidebar = document.getElementById('main-menu');
const sidebarToggle = document.querySelector('.js-change-link');
const enhanced = {};

const closeAllSidebarBlocksExcept = (targetItem?: HTMLElement): void => {
    const sections = [...document.querySelectorAll('.js-close-nav-list')];

    sections.forEach(section => {
        if (section !== targetItem) {
            section.removeAttribute('open');
        }
    });
};

const toggleSidebar = (trigger: HTMLElement): void => {
    const html = document.documentElement;
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

const enhanceCheckbox = (checkbox: HTMLElement): void => {
    fastdom.read(() => {
        const button = document.createElement('button');
        const checkboxId = checkbox.id;
        const checkboxControls = checkbox.getAttribute('aria-controls');
        const enhance = () => {
            [...checkbox.classList].forEach(c => button.classList.add(c));

            button.setAttribute('id', checkboxId);
            button.setAttribute('aria-expanded', 'false');

            if (checkboxControls) {
                button.setAttribute('aria-controls', checkboxControls);
            }

            if (checkbox.parentNode) {
                checkbox.parentNode.replaceChild(button, checkbox);
            }

            button.addEventListener('click', (event: Event) => {
                // #? hacky type cast
                const target: HTMLElement = (event.target: any);
                toggleSidebar(target);
            });

            enhanced[button.id] = true;
        };

        fastdom.write(enhance);
    });
};

const enhanceCheckboxesToButtons = (): void => {
    const checkbox = document.getElementById('main-menu-toggle');

    if (!checkbox) {
        return;
    }

    if (!enhanced[checkbox.id] && !checkbox.checked) {
        enhanceCheckbox(checkbox);
    } else {
        const closeMenuHandler = (): void => {
            enhanceCheckbox(checkbox);
            checkbox.removeEventListener('click', closeMenuHandler);
        };

        checkbox.addEventListener('click', closeMenuHandler);

        ophan.record({
            component: 'main-navigation',
            value: 'is fully expanded',
        });
    }
};

const addEventHandler = (): void => {
    if (!sidebar) {
        return;
    }

    sidebar.addEventListener('click', (event: Event) => {
        const target: HTMLElement = (event.target: any);

        if (target.matches('.js-close-nav-list')) {
            event.stopPropagation();
            closeAllSidebarBlocksExcept(target);
        }
    });
};

const init = (): void => {
    enhanceCheckboxesToButtons();
    addEventHandler();
    userAccount();
};

export default init;
