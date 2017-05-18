// @flow

import fastdom from 'fastdom';
import { scrollToElement } from 'lib/scroller';
import userAccount from 'common/modules/navigation/user-account';

const enhanced = {};

const getFlyIn = (): ?HTMLElement => document.getElementById('main-menu');

const closeSidebarSection = (section: HTMLElement): void => {
    section.removeAttribute('open');
};

const closeAllSidebarSections = (exclude?: HTMLElement): void => {
    const sections = [...document.querySelectorAll('.js-close-nav-list')];

    sections.forEach(section => {
        if (section !== exclude) {
            closeSidebarSection(section);
        }
    });
};

const openSidebarSection = (
    section: HTMLElement,
    options?: Object = {}
): void => {
    section.setAttribute('open', '');

    if (options.scrollIntoView === true) {
        scrollToElement(section, 0, 'easeInQuad', getFlyIn());
    }
};

const toggleSidebar = (): void => {
    const documentElement = document.documentElement;
    const openClass = 'new-header--open';
    const globalOpenClass = 'nav-is-open';
    const trigger = document.querySelector('.veggi-burger');
    const newHeader = document.querySelector('.new-header');
    const flyInToggle = newHeader && newHeader.querySelector('.js-change-link');
    const isOpen = trigger && trigger.getAttribute('aria-expanded') === 'true';
    const flyIn = getFlyIn();

    if (!newHeader || !flyIn || !flyInToggle) {
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

        flyInToggle.setAttribute(
            'data-link-name',
            `nav2 : veggie-burger : ${isOpen ? 'show' : 'hide'}`
        );

        if (trigger) {
            trigger.setAttribute('aria-expanded', expandedAttr);
        }

        flyIn.setAttribute('aria-hidden', hiddenAttr);
        newHeader.classList.toggle(openClass, !isOpen);

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

            button.addEventListener('click', () => toggleSidebar());
            button.setAttribute('id', checkboxId);
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('data-link-name', 'nav2 : toggle');

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
    }
};

const toggleSidebarWithOpenSection = () => {
    const flyIn = getFlyIn();
    const subnav = document.querySelector('.subnav');
    const pillarTitle = (subnav && subnav.dataset.pillarTitle) || '';
    const targetSelector = `.js-navigation-item[data-section-name="${pillarTitle}"]`;
    const target = flyIn && flyIn.querySelector(targetSelector);

    if (target) {
        openSidebarSection(target.children[0], { scrollIntoView: true });
    }

    toggleSidebar();
};

const addEventHandler = (): void => {
    const subnav = document.querySelector('.subnav');
    const toggle = document.querySelector('.js-toggle-nav-section');
    const flyIn = getFlyIn();

    if (!flyIn) {
        return;
    }

    flyIn.addEventListener('click', (event: Event) => {
        const target: HTMLElement = (event.target: any);

        if (target.matches('.js-close-nav-list')) {
            event.stopPropagation();
            closeAllSidebarSections(target);
        }
    });

    if (subnav && toggle) {
        toggle.addEventListener('click', () => {
            toggleSidebarWithOpenSection();
        });
    }
};

export const newHeaderNavigationInit = (): void => {
    enhanceSidebarToggle();
    addEventHandler();
    userAccount();
    closeAllSidebarSections();
};
