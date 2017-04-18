// @flow

import fastdom from 'fastdom';
import ophan from 'ophan/ng';
import { scrollToElement } from 'lib/scroller';
import userAccount from 'common/modules/navigation/user-account';

const enhanced = {};

const getSidebarElement = (): ?HTMLElement =>
    document.getElementById('main-menu');

const closeAllSidebarSections = (exclude: HTMLElement): void => {
    const sections = [...document.querySelectorAll('.js-close-nav-list')];
    sections.forEach(section => {
        if (section !== exclude) {
            closeSidebarSection(section);
        }
    });
};

const closeSidebarSection = (section: HTMLElement): void => {
    section.removeAttribute('open');
};

const openSidebarSection = (section: HTMLElement, options?: Object = {}): void => {
    section.setAttribute('open', '');

    if (options.scrollIntoView === true) {
        scrollToElement(section, 0, 'easeInQuad', getSidebarElement());
    }
};

const toggleSidebar = (): void => {
    const documentElement = document.documentElement;
    const sidebarToggle = document.querySelector('.js-change-link');
    const openClass = 'new-header__nav__menu-button--open';
    const globalOpenClass = 'nav-is-open';
    const trigger = document.querySelector('.new-header__nav-trigger');
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    const sidebar = getSidebarElement();

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

    const focusFirstSidebarSection = (): void => {
        const firstSection = document.querySelector('.js-navigation-button');

        if (firstSection) {
            firstSection.focus();
        }
    };

    const update = () => {
        const expandedAttr = isOpen ? 'false' : 'true';
        const hiddenAttr = isOpen ? 'true' : 'false';

        sidebarToggle.setAttribute(
            'data-link-name',
            `nav2 : veggie-burger : ${isOpen ? 'show' : 'hide'}`
        );

        trigger.setAttribute('aria-expanded', expandedAttr);
        sidebar.setAttribute('aria-hidden', hiddenAttr);
        sidebarToggle.classList.toggle(openClass, !isOpen);

        if (documentElement) {
            documentElement.classList.toggle(globalOpenClass, !isOpen);
        }

        if (isOpen) {
            resetItemOrder();
        } else {
            focusFirstSidebarSection();
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

            button.addEventListener('click', (event: Event) => toggleSidebar());
            button.setAttribute('id', checkboxId);
            button.setAttribute('aria-expanded', 'false');

            if (checkboxControls) {
                button.setAttribute('aria-controls', checkboxControls);
            }

            if (checkbox.parentNode) {
                checkbox.parentNode.replaceChild(button, checkbox);
            }

            enhanced[button.id] = true;
        };

        fastdom.write(enhance);
    });
};

const enhanceSidebarToggle = (): void => {
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

const toggleSidebarWithOpenSection = () => {
    const sidebar = getSidebarElement();
    const sectionId = document.querySelector('.subnav').dataset.sectionId;
    const targetSelector = `.js-navigation-item[data-section-id="${sectionId}"]`;
    const target = sidebar.querySelector(targetSelector);

    if (target) {
        openSidebarSection(target.children[0], { scrollIntoView: true });
    }

    toggleSidebar();

    ophan.record({
        component: 'main-navigation',
        value: 'is opened by "more" toggle',
    });
};

const addEventHandler = (): void => {
    const subnav = document.querySelector('.subnav');
    const sidebar = getSidebarElement();

    if (!sidebar) {
        return;
    }

    sidebar.addEventListener('click', (event: Event) => {
        const target: HTMLElement = (event.target: any);

        if (target.matches('.js-close-nav-list')) {
            event.stopPropagation();
            closeAllSidebarSections(target);
        }
    });

    subnav.addEventListener('click', (event: Event) => {
        const target: HTMLElement = (event.target: any);

        if (target.matches('.js-toggle-nav-section')) {
            event.stopPropagation();
            toggleSidebarWithOpenSection();
        }
    });
};

const init = (): void => {
    enhanceSidebarToggle();
    addEventHandler();
    userAccount();
    closeAllSidebarSections();
};

export default init;
