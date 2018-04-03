// @flow

import debounce from 'lodash/functions/debounce';
import ophan from 'ophan/ng';
import { isBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { local } from 'lib/storage';
import { scrollToElement } from 'lib/scroller';
import { addEventListener } from 'lib/events';
import { showMyAccountIfNecessary } from './user-account';

type MenuAndTriggerEls = {
    menu: HTMLElement,
    trigger: HTMLElement,
};

const enhanced = {};
const SEARCH_STORAGE_KEY = 'gu.recent.search';

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

            // On desktop clicking outside menu should close it
            if (
                isBreakpoint({
                    min: 'desktop',
                })
            ) {
                mediator.on('module:clickstream:click', function triggerToggle(
                    clickSpec
                ) {
                    const elem = clickSpec ? clickSpec.target : null;

                    // if anywhere else but the links are clicked, the dropdown will close
                    if (elem !== menu) {
                        toggleMenu();
                        // remove event when the dropdown closes
                        mediator.off('module:clickstream:click', triggerToggle);
                    }
                });
            }
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
        }
    };

    fastdom.write(update);
};

const toggleDropdown = (menuAndTriggerEls: MenuAndTriggerEls): void => {
    const openClass = 'dropdown-menu--open';

    fastdom.read(() => menuAndTriggerEls).then(els => {
        const { menu, trigger } = els;

        if (!menu) {
            return;
        }

        const isOpen = menu.classList.contains(openClass);
        const expandedAttr = isOpen ? 'false' : 'true';
        const hiddenAttr = isOpen ? 'true' : 'false';

        return fastdom.write(() => {
            if (trigger) {
                trigger.setAttribute('aria-expanded', expandedAttr);
            }

            menu.setAttribute('aria-hidden', hiddenAttr);
            menu.classList.toggle(openClass, !isOpen);

            if (!isOpen) {
                mediator.on('module:clickstream:click', function triggerToggle(
                    clickSpec
                ) {
                    const elem = clickSpec ? clickSpec.target : null;

                    // if anywhere else but the links are clicked, the dropdown will close
                    if (elem !== menu) {
                        toggleDropdown(menuAndTriggerEls);
                        // remove event when the dropdown closes
                        mediator.off('module:clickstream:click', triggerToggle);
                    }
                });
            }
        });
    });
};

const initiateUserAccountDropdown = (): void => {
    fastdom
        .read(() => ({
            menu: document.querySelector('.js-user-account-dropdown-menu'),
            trigger: document.querySelector('.js-user-account-trigger'),
        }))
        .then((userAccountDropdownEls: MenuAndTriggerEls) => {
            const button = userAccountDropdownEls.trigger;

            if (button && button instanceof HTMLButtonElement) {
                button.addEventListener('click', () =>
                    toggleDropdown(userAccountDropdownEls)
                );
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

        const menuEl: ?HTMLElement = document.querySelector(
            '.js-edition-dropdown-menu'
        );
        const triggerEl: ?HTMLElement = document.querySelector(
            '.js-edition-picker-trigger'
        );

        const buttonClickHandlers = {};

        buttonClickHandlers['main-menu-toggle'] = toggleMenu;

        if (
            menuEl &&
            menuEl instanceof HTMLElement &&
            triggerEl &&
            triggerEl instanceof HTMLElement
        ) {
            const editionPickerDropdownEls: MenuAndTriggerEls = {
                menu: menuEl,
                trigger: triggerEl,
            };

            buttonClickHandlers['edition-picker-toggle'] = toggleDropdown.bind(
                null,
                editionPickerDropdownEls
            );
        }

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

const showMoreButton = (): void => {
    fastdom
        .read(() => {
            const moreButton = document.querySelector('.js-show-more-button');
            const subnav = document.querySelector('.js-expand-subnav');
            const subnavList = document.querySelector(
                '.js-get-last-child-subnav'
            );

            if (subnav && subnavList) {
                const subnavItems = subnavList.querySelectorAll('li');
                const lastChild = subnavItems[subnavItems.length - 1];

                const lastChildRect = lastChild.getBoundingClientRect();
                const subnavRect = subnav.getBoundingClientRect();

                return { moreButton, lastChildRect, subnavRect };
            }
        })
        .then(els => {
            if (els) {
                const { moreButton, lastChildRect, subnavRect } = els;

                // +1 to compensate for the border top on the subnav
                if (subnavRect.top + 1 === lastChildRect.top) {
                    fastdom.write(() => {
                        moreButton.classList.add('is-hidden');
                    });
                }
            }
        });
};

const toggleSubnavSections = (moreButton: HTMLElement): void => {
    fastdom
        .read(() => document.querySelector('.js-expand-subnav'))
        .then(subnav => {
            if (subnav) {
                fastdom.write(() => {
                    const isOpen = subnav.classList.contains(
                        'subnav--expanded'
                    );

                    subnav.classList.toggle('subnav--expanded');

                    moreButton.innerText = isOpen ? 'More' : 'Less';
                });
            }
        });
};

const addEventHandler = (): void => {
    const menu = getMenu();
    const search = menu && menu.querySelector('.js-menu-search');
    const toggleWithMoreButton = document.querySelector(
        '.js-toggle-more-sections'
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
            toggleSubnavSections(toggleWithMoreButton);
        });
    }
};

export const newHeaderInit = (): void => {
    enhanceMenuToggles();
    showMoreButton();
    addEventHandler();
    showMyAccountIfNecessary();
    initiateUserAccountDropdown();
    closeAllMenuSections();
    trackRecentSearch();
};
