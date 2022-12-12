import debounce from 'lodash/debounce';
import ophan from 'ophan/ng';
import { isBreakpoint } from 'lib/detect';
import { mediator } from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';
import { storage } from '@guardian/libs';
import { scrollToElement } from 'lib/scroller';
import { addEventListener } from 'lib/events';
import { showMyAccountIfNecessary } from 'projects/common/modules/navigation/user-account';

const enhanced = {};
const clickstreamListeners = {};
const SEARCH_STORAGE_KEY = 'gu.recent.search';
const MY_ACCOUNT_ID = 'my-account-toggle';
const MENU_TOGGLE_ID = 'main-menu-toggle';
const EDITION_PICKER_TOGGLE_ID = 'edition-picker-toggle';

const getMenu = () => document.getElementsByClassName('js-main-menu')[0];

const getSectionToggleMenuItem = (section) => {
	const children = Array.from(section.children);
	return children.find((child) =>
		child.classList.contains('menu-item__title'),
	);
};

const closeMenuSection = (section) => {
	const toggle = getSectionToggleMenuItem(section);

	if (toggle) {
		toggle.setAttribute('aria-expanded', 'false');
	}
};

const closeAllMenuSections = (exclude) => {
	const sections = Array.from(
		document.querySelectorAll('.js-navigation-item'),
	);

	sections.forEach((section) => {
		if (section !== exclude) {
			closeMenuSection(section);
		}
	});
};

const openMenuSection = (section, options = {}) => {
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

const isMenuSectionClosed = (section) => {
	const toggle = getSectionToggleMenuItem(section);

	if (toggle) {
		return toggle.getAttribute('aria-expanded') === 'false';
	}

	return true;
};

const toggleMenuSection = (section) => {
	if (isMenuSectionClosed(section)) {
		openMenuSection(section);
	} else {
		closeMenuSection(section);
	}
};

const removeClickstreamListener = (menuId) => {
	const clickHandler = clickstreamListeners[menuId];
	mediator.off('module:clickstream:click', clickHandler);
	delete clickstreamListeners[menuId];
};

const registerClickstreamListener = (menuId, clickHandler) => {
	removeClickstreamListener(menuId);
	mediator.on('module:clickstream:click', clickHandler);
	clickstreamListeners[menuId] = clickHandler;
};

const toggleMenu = () => {
	const documentElement = document.documentElement;
	const openClass = 'header-top-nav--open';
	const globalOpenClass = 'nav-is-open';
	const trigger = document.querySelector('.veggie-burger');
	const header = document.querySelector('.header-top-nav');
	const menuToggle = header && header?.querySelector('.js-change-link');
	const isOpen = trigger && trigger.getAttribute('aria-expanded') === 'true';
	const menu = getMenu();

	if (!header || !menu || !menuToggle) {
		return;
	}

	const resetItemOrder = () => {
		const items = Array.from(
			document.querySelectorAll('.js-navigation-item'),
		);

		items.forEach((item) => {
			const listItem = item;
			listItem.style.order = '';
		});
	};

	const focusFirstMenuSection = () => {
		const firstSection = document.querySelector('.js-navigation-button');

		if (firstSection) {
			firstSection.focus();
		}
	};

	const update = () => {
		const expandedAttr = isOpen ? 'false' : 'true';
		const hiddenAttr = isOpen ? 'true' : 'false';
		const haveToCalcTogglePosition = () =>
			isBreakpoint({
				min: 'tablet',
				max: 'desktop',
			});
		const enhanceMenuMargin = () => {
			const body = document.body;

			if (!body || !haveToCalcTogglePosition()) {
				return Promise.resolve();
			}

			return fastdom
				.measure(() => {
					const docRect = body.getBoundingClientRect();
					const rect = menuToggle.getBoundingClientRect();
					return docRect.right - rect.right + rect.width / 2;
				})
				.then((marginRight) =>
					fastdom.mutate(() => {
						menu.style.marginRight = `${marginRight}px`;
					}),
				);
		};
		const debouncedMenuEnhancement = debounce(enhanceMenuMargin, 200);
		const removeEnhancedMenuMargin = () =>
			fastdom.mutate(() => {
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
				const menuId = menu.getAttribute('id');
				const triggerToggle = (clickSpec) => {
					const elem = clickSpec ? clickSpec.target : null;

					if (elem !== menu) {
						toggleMenu();
						// remove event listener when the menu closes
						if (menuId) {
							removeClickstreamListener(menuId);
						}
					}
				};
				// if anywhere outside the menu is clicked the menu will close
				if (menuId) {
					registerClickstreamListener(menuId, triggerToggle);
				}
			}
		} else {
			removeEnhancedMenuMargin().then(() => {
				window.removeEventListener('resize', debouncedMenuEnhancement);
			});
		}

		menuToggle.setAttribute(
			'data-link-name',
			`nav2 : veggie-burger : ${isOpen ? 'show' : 'hide'}`,
		);

		if (trigger) {
			trigger.setAttribute('aria-expanded', expandedAttr);
		}

		menu.setAttribute('aria-hidden', hiddenAttr);
		header.classList.toggle(openClass, !isOpen);

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

	fastdom.mutate(update);
};

const toggleDropdown = (menuAndTriggerEls) => {
	const documentElement = document.documentElement;
	const globalOpenClass = 'dropdown--open';
	const openClass = 'dropdown-menu--open';

	fastdom
		.measure(() => menuAndTriggerEls)
		.then((els) => {
			const { menu, trigger } = els;

			if (!menu) {
				return;
			}

			const isOpen = menu.classList.contains(openClass);
			const expandedAttr = isOpen ? 'false' : 'true';
			const hiddenAttr = isOpen ? 'true' : 'false';

			return fastdom.mutate(() => {
				if (trigger) {
					trigger.setAttribute('aria-expanded', expandedAttr);
				}

				menu.setAttribute('aria-hidden', hiddenAttr);
				menu.classList.toggle(openClass, !isOpen);

				if (documentElement) {
					documentElement.classList.toggle(globalOpenClass, !isOpen);
				}

				if (!isOpen && document.body) {
					// Prevents menu from being disconnected with trigger
					(document.documentElement || document.body).scrollTop = 0;

					const menuId = menu.getAttribute('id');
					const triggerToggle = (clickSpec) => {
						const elem = clickSpec ? clickSpec.target : null;
						if (elem !== menu) {
							toggleDropdown(menuAndTriggerEls);

							// remove event listener when the dropdown closes
							if (menuId) {
								removeClickstreamListener(menuId);
							}
						}
					};
					// if anywhere outside the menu is clicked the dropdown will close
					registerClickstreamListener(menuId, triggerToggle);
				}
			});
		});
};

const returnFocusToButton = (btnId) => {
	fastdom
		.measure(() => document.getElementById(btnId))
		.then((btn) => {
			if (btn) {
				btn.focus();
				/**
				 * As we're closing the menu with the ESC key we no longer need the
				 * clickstream listener that toggles the menu on a click outside the menu
				 * so let's unregister it here
				 * */
				const menuId = btn.getAttribute('aria-controls');
				if (menuId) {
					removeClickstreamListener(menuId);
				}
			}
		});
};

const genericToggleMenu = (menuClassName, triggerClassName) => {
	const menu = document.querySelector(menuClassName);

	const trigger = document.querySelector(triggerClassName);

	if (menu && trigger) {
		toggleDropdown({
			menu,
			trigger,
		});
	}
};

const toggleEditionPicker = () =>
	genericToggleMenu(
		'.js-edition-dropdown-menu',
		'.js-edition-picker-trigger',
	);

const toggleMyAccountMenu = () =>
	genericToggleMenu(
		'.js-user-account-dropdown-menu',
		'.js-user-account-trigger',
	);

const buttonClickHandlers = {
	[MENU_TOGGLE_ID]: toggleMenu,
	[EDITION_PICKER_TOGGLE_ID]: toggleEditionPicker,
	[MY_ACCOUNT_ID]: toggleMyAccountMenu,
};

const menuKeyHandlers = {
	[MENU_TOGGLE_ID]: (event) => {
		if (event.key === 'Escape') {
			toggleMenu();
			returnFocusToButton(MENU_TOGGLE_ID);
		}
	},
	[EDITION_PICKER_TOGGLE_ID]: (event) => {
		if (event.key === 'Escape') {
			toggleEditionPicker();
			returnFocusToButton(EDITION_PICKER_TOGGLE_ID);
		}
	},
	[MY_ACCOUNT_ID]: (event) => {
		if (event.key === 'Escape') {
			toggleMyAccountMenu();
			returnFocusToButton(MY_ACCOUNT_ID);
		}
	},
};

const enhanceCheckbox = (checkbox) => {
	fastdom.measure(() => {
		const button = document.createElement('button');
		const checkboxId = checkbox.id;
		const checkboxControls = checkbox.getAttribute('aria-controls');
		const dataLinkName = checkbox.getAttribute('data-link-name');
		const label = document.querySelector(`label[for='${checkboxId}']`);

		const enhance = () => {
			button.setAttribute('id', checkboxId);

			const clickHandler = buttonClickHandlers[checkboxId];

			if (clickHandler) {
				button.addEventListener('click', clickHandler);
			}

			button.setAttribute('aria-expanded', 'false');

			if (dataLinkName) {
				button.setAttribute('data-link-name', dataLinkName);
			}

			if (checkboxControls) {
				button.setAttribute('aria-controls', checkboxControls);

				const menu = document.getElementById(checkboxControls);
				const keyHandler = menuKeyHandlers[checkboxId];

				if (menu && keyHandler) {
					menu.addEventListener('keyup', keyHandler);
				}
			}

			if (label) {
				label.classList.forEach((className) => {
					button.classList.add(className);
				});

				button.classList.add(`${checkboxId}-button`);

				const labelTabIndex = label.getAttribute('tabindex');

				if (labelTabIndex) {
					button.setAttribute('tabindex', labelTabIndex);
				}

				button.innerHTML = label.innerHTML;

				label.remove();
			}

			if (checkbox.parentNode) {
				checkbox.parentNode.replaceChild(button, checkbox);
			}

			enhanced[button.id] = true;
		};

		fastdom.mutate(enhance);
	});
};

const enhanceMenuToggles = () => {
	const checkboxs = Array.from(
		document.getElementsByClassName('js-enhance-checkbox'),
	);

	checkboxs.forEach((checkbox) => {
		if (!enhanced[checkbox.id] && !checkbox.checked) {
			enhanceCheckbox(checkbox);
		} else {
			const closeMenuHandler = () => {
				enhanceCheckbox(checkbox);
				checkbox.removeEventListener('click', closeMenuHandler);
			};

			checkbox.addEventListener('click', closeMenuHandler);
		}
	});
};

const getRecentSearch = () => storage.local.get(SEARCH_STORAGE_KEY);

const clearRecentSearch = () => storage.local.remove(SEARCH_STORAGE_KEY);

const trackRecentSearch = () => {
	const recent = getRecentSearch();

	if (recent) {
		ophan.record({
			component: 'header-top-nav-search',
			value: recent,
		});

		clearRecentSearch();
	}
};

const saveSearchTerm = (term) => storage.local.set(SEARCH_STORAGE_KEY, term);

const showMoreButton = () => {
	fastdom
		.measure(() => {
			const moreButton = document.querySelector('.js-show-more-button');
			const subnav = document.querySelector('.js-expand-subnav');
			const subnavList = document.querySelector(
				'.js-get-last-child-subnav',
			);

			if (subnav && subnavList) {
				const subnavItems = subnavList.querySelectorAll('li');
				const lastChild = subnavItems[subnavItems.length - 1];

				const lastChildRect = lastChild.getBoundingClientRect();
				const subnavRect = subnav.getBoundingClientRect();

				return { moreButton, lastChildRect, subnavRect };
			}
		})
		.then((els) => {
			if (els) {
				const { moreButton, lastChildRect, subnavRect } = els;

				// +1 to compensate for the border top on the subnav
				if (subnavRect.top + 1 === lastChildRect.top) {
					fastdom.mutate(() => {
						if (moreButton) {
							moreButton.classList.add('is-hidden');
						}
					});
				}
			}
		});
};

const toggleSubnavSections = (moreButton) => {
	fastdom
		.measure(() => document.querySelector('.js-expand-subnav'))
		.then((subnav) => {
			if (subnav) {
				fastdom.mutate(() => {
					const isOpen =
						subnav.classList.contains('subnav--expanded');

					subnav.classList.toggle('subnav--expanded');

					moreButton.innerText = isOpen ? 'More' : 'Less';
				});
			}
		});
};

const addEventHandler = () => {
	const menu = getMenu();
	const search = menu && menu.querySelector('.js-menu-search');
	const toggleWithMoreButton = document.querySelector(
		'.js-toggle-more-sections',
	);

	if (menu) {
		menu.addEventListener('click', (event) => {
			const selector = '.js-navigation-toggle';
			const target = event.target;

			if (target.matches(selector)) {
				const parent = target.parentNode;

				if (parent) {
					event.preventDefault();
					event.stopPropagation();
					toggleMenuSection(parent);
				}
			}
		});
	}

	if (search) {
		search.addEventListener('submit', (event) => {
			const target = event.target.querySelector('.js-menu-search-term');

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

export const headerTopNavInit = () => {
	enhanceMenuToggles();
	showMoreButton();
	addEventHandler();
	showMyAccountIfNecessary();
	closeAllMenuSections();
	trackRecentSearch();
};
