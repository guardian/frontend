// @flow

import debounce from 'lodash/functions/debounce';
import ophan from 'ophan/ng';
import { isBreakpoint } from 'lib/detect';
import fastdom from 'lib/fastdom-promise';
import { local } from 'lib/storage';
import { scrollToElement } from 'lib/scroller';
import { addEventListener } from 'lib/events';
import { showMyAccountIfNecessary, enhanceAvatar } from './user-account';

const enhanced = {};
const SEARCH_STORAGE_KEY = 'gu.recent.search';
let avatarIsEnhanced = false;

const getMenu = (): ?HTMLElement =>
    document.getElementsByClassName('js-main-menu')[0];

const getSectionToggleMenuItem = (section: HTMLElement): ?HTMLElement => {
    const children = [...section.children];
    return children.find(child => child.classList.contains('menu-item__title'));
};

const closeMenuSection = (section: HTMLElement): void => {
    const toggle = getSectionToggleMenuItem(section);

    if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
    }
};

const closeAllMenuSections = (exclude?: Node): void => {
    const sections = [...document.querySelectorAll('.js-navigation-item')];

    sections.forEach(section => {
        if (section !== exclude) {
            closeMenuSection(section);
        }
    });
};

const openMenuSection = (section: HTMLElement, options?: Object = {}): void => {
    const toggle = getSectionToggleMenuItem(section);

    if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
    }

    if (options.scrollIntoView === true) {
        scrollToElement(section, 0, 'easeInQuad', getMenu());
    }

    // the sections should behave like an accordion
    closeAllMenuSections(section);
};

const isMenuSectionClosed = (section: HTMLElement): boolean => {
    const toggle = getSectionToggleMenuItem(section);

    if (toggle) {
        return toggle.getAttribute('aria-expanded') === 'false';
    }

    return true;
};

const toggleMenuSection = (section: HTMLElement): void => {
    if (isMenuSectionClosed(section)) {
        openMenuSection(section);
    } else {
        closeMenuSection(section);
    }
};

const toggleMenu = (): void => {
    const documentElement = document.documentElement;
    const openClass = 'new-header--open';
    const globalOpenClass = 'nav-is-open';
    const trigger = document.querySelector('.veggie-burger');
    const newHeader = document.querySelector('.new-header');
    const menuToggle = newHeader && newHeader.querySelector('.js-change-link');
    const isOpen = trigger && trigger.getAttribute('aria-expanded') === 'true';
    const menu = getMenu();

    if (!newHeader || !menu || !menuToggle) {
        return;
    }

    const resetItemOrder = (): void => {
        const items = [...document.querySelectorAll('.js-navigation-item')];

        items.forEach(item => {
            const listItem = item;
            listItem.style.order = '';
        });
    };

    const focusFirstMenuSection = (): void => {
        const firstSection = document.querySelector('.js-navigation-button');

        if (firstSection) {
            firstSection.focus();
        }
    };

    const update = () => {
        const expandedAttr = isOpen ? 'false' : 'true';
        const hiddenAttr = isOpen ? 'true' : 'false';
        const haveToCalcTogglePosition = (): boolean =>
            isBreakpoint({
                min: 'tablet',
                max: 'desktop',
            });
        const enhanceMenuMargin = (): Promise<void> => {
            const body = document.body;

            if (!body || !haveToCalcTogglePosition()) {
                return Promise.resolve();
            }

            return fastdom
                .read(() => {
                    const docRect = body.getBoundingClientRect();
                    const rect = menuToggle.getBoundingClientRect();
                    return docRect.right - rect.right + rect.width / 2;
                })
                .then(marginRight =>
                    fastdom.write(() => {
                        menu.style.marginRight = `${marginRight}px`;
                    })
                );
        };
        const debouncedMenuEnhancement = debounce(enhanceMenuMargin, 200);
        const removeEnhancedMenuMargin = (): Promise<void> =>
            fastdom.write(() => {
                menu.style.marginRight = '';
            });

        /*
            Between tablet and desktop the veggie-burger does not have a fixed
            margin to the right. Therefore we have to calculate it's midpoint
            and apply it as a margin to the menu.
            The listeners have to be applied always, because the device
            orientation could change and force the layout into the next
            breakpoint.
        */
        if (!isOpen) {
            enhanceMenuMargin().then(() => {
                addEventListener(window, 'resize', debouncedMenuEnhancement, {
                    passive: true,
                });
            });
        } else {
            removeEnhancedMenuMargin().then(() => {
                window.removeEventListener('resize', debouncedMenuEnhancement);
            });
        }

        menuToggle.setAttribute(
            'data-link-name',
            `nav2 : veggie-burger : ${isOpen ? 'show' : 'hide'}`
        );

        if (trigger) {
            trigger.setAttribute('aria-expanded', expandedAttr);
        }

        menu.setAttribute('aria-hidden', hiddenAttr);
        newHeader.classList.toggle(openClass, !isOpen);

        if (documentElement) {
            documentElement.classList.toggle(globalOpenClass, !isOpen);
        }

        if (isOpen) {
            resetItemOrder();
            closeAllMenuSections();
        } else {
            focusFirstMenuSection();

            if (!avatarIsEnhanced) {
                enhanceAvatar();
                avatarIsEnhanced = true;
            }
        }
    };

    fastdom.write(update);
};

const toggleEditionPickerDropdown = () => {
    const openClass = 'dropdown-menu--open';

    fastdom.read(() => {
        const editionPickerMenu = document.querySelector(
            '.js-edition-dropdown-menu'
        );
        const trigger = document.querySelector('.js-edition-picker-trigger');

        if (editionPickerMenu) {
            const isOpen = editionPickerMenu.classList.contains(openClass);
            const expandedAttr = isOpen ? 'false' : 'true';
            const hiddenAttr = isOpen ? 'true' : 'false';

            const toggleDropdown = () => {
                if (trigger) {
                    trigger.setAttribute('aria-expanded', expandedAttr);
                }

                editionPickerMenu.setAttribute('aria-hidden', hiddenAttr);
                editionPickerMenu.classList.toggle(openClass, !isOpen);
            };

            fastdom.write(toggleDropdown);
        }
    });
};

const enhanceCheckbox = (checkbox: HTMLElement): void => {
    fastdom.read(() => {
        const button = document.createElement('button');
        const checkboxId = checkbox.id;
        const checkboxControls = checkbox.getAttribute('aria-controls');
        const checkboxClassAttr = checkbox.getAttribute('class');
        const dataLinkName = checkbox.getAttribute('data-link-name');
        const buttonClickHandlers = {
            'main-menu-toggle': toggleMenu,
            'edition-picker-toggle': toggleEditionPickerDropdown,
        };

        const enhance = () => {
            const eventHandler = buttonClickHandlers[checkboxId];

            if (checkboxClassAttr) {
                button.setAttribute('class', checkboxClassAttr);
            }

            button.addEventListener('click', () => eventHandler());
            button.setAttribute('id', checkboxId);
            button.setAttribute('aria-expanded', 'false');

            if (dataLinkName) {
                button.setAttribute('data-link-name', dataLinkName);
            }

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

const enhanceMenuToggles = (): void => {
    const checkboxs = [
        ...document.getElementsByClassName('js-enhance-checkbox'),
    ];

    checkboxs.forEach(checkbox => {
        if (!enhanced[checkbox.id] && !checkbox.checked) {
            enhanceCheckbox(checkbox);
        } else {
            const closeMenuHandler = (): void => {
                enhanceCheckbox(checkbox);
                checkbox.removeEventListener('click', closeMenuHandler);
            };

            checkbox.addEventListener('click', closeMenuHandler);
        }
    });
};

const toggleMenuWithOpenSection = () => {
    const menu = getMenu();
    const subnav = document.querySelector('.subnav__list');
    const pillarTitle = (subnav && subnav.dataset.pillarTitle) || '';
    const targetSelector = `.js-navigation-item[data-section-name="${pillarTitle}"]`;
    const section = menu && menu.querySelector(targetSelector);

    if (section) {
        openMenuSection(section, { scrollIntoView: true });
    }

    toggleMenu();
};

const getRecentSearch = (): ?string => local.get(SEARCH_STORAGE_KEY);

const clearRecentSearch = (): void => local.remove(SEARCH_STORAGE_KEY);

const trackRecentSearch = (): void => {
    const recent = getRecentSearch();

    if (recent) {
        ophan.record({
            component: 'new-header-search',
            value: recent,
        });

        clearRecentSearch();
    }
};

const saveSearchTerm = (term: string) => local.set(SEARCH_STORAGE_KEY, term);

const addEventHandler = (): void => {
    const menu = getMenu();
    const search = menu && menu.querySelector('.js-menu-search');
    const toggleWithMoreButton = document.querySelector(
        '.js-toggle-nav-section'
    );

    if (menu) {
        menu.addEventListener('click', (event: Event) => {
            const selector = '.js-navigation-toggle';
            const target: HTMLElement = (event.target: any);

            if (target.matches(selector)) {
                const parent: HTMLElement = (target.parentNode: any);

                if (parent) {
                    event.preventDefault();
                    toggleMenuSection(parent);
                }
            }
        });
    }

    if (search) {
        search.addEventListener('submit', (event: Event) => {
            const target = (event.target: any).querySelector(
                '.js-menu-search-term'
            );

            if (target) {
                const term = target.value;
                saveSearchTerm(term);
            }
        });
    }

    if (toggleWithMoreButton) {
        toggleWithMoreButton.addEventListener('click', () => {
            toggleMenuWithOpenSection();
        });
    }
};

export const newHeaderInit = (): void => {
    enhanceMenuToggles();
    addEventHandler();
    showMyAccountIfNecessary();
    closeAllMenuSections();
    trackRecentSearch();
};
