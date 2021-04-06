import fastdom from 'lib/fastdom-promise';
import loadEnhancers from './modules/loadEnhancers';

const ERR_UNDEFINED_MENU = 'Undefined menu';

const showAccountMenu = (
    buttonEl,
    menuEl
) =>
    fastdom.mutate(() => {
        menuEl.classList.add('is-active');
        menuEl.setAttribute('aria-hidden', 'false');
        buttonEl.setAttribute('aria-expanded', 'true');
    });

const hideAccountMenu = (
    buttonEl,
    menuEl
) =>
    fastdom.mutate(() => {
        menuEl.classList.remove('is-active');
        menuEl.setAttribute('aria-hidden', 'true');
        buttonEl.setAttribute('aria-expanded', 'false');
    });

const bindNavToggle = (buttonEl) => {
    buttonEl.addEventListener('click', (ev) => {
        const menuElSelector = buttonEl.getAttribute('aria-controls');
        if (!menuElSelector) throw new Error(ERR_UNDEFINED_MENU);

        ev.preventDefault();

        fastdom
            .measure(() => document.getElementById(menuElSelector))
            .then((menuEl) => {
                if (!menuEl) throw new Error(ERR_UNDEFINED_MENU);
                const watchForOutsideClick = subEv => {
                    if (!menuEl.contains(subEv.target)) {
                        hideAccountMenu(buttonEl, menuEl);
                        window.removeEventListener(
                            'click',
                            watchForOutsideClick
                        );
                    }
                };
                showAccountMenu(buttonEl, menuEl);
                window.addEventListener('click', watchForOutsideClick);
            });
    });
};

const initHeader = () => {
    const loaders = [['.js_identity-header__nav-toggle', bindNavToggle]];
    loadEnhancers(loaders);
};

export { initHeader };
