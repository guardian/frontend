// @flow

import fastdom from 'lib/fastdom-promise';
import loadEnhancers from './modules/loadEnhancers';

const showAccountMenu = (buttonEl: HTMLElement, menuEl: HTMLElement):Promise<void> => {
    return fastdom.write(() => {
        menuEl.classList.add('is-active');
        menuEl.setAttribute('aria-hidden', false);
        buttonEl.setAttribute('aria-expanded', true);
    });
}

const hideAccountMenu = (buttonEl: HTMLElement, menuEl: HTMLElement):Promise<void> => {
    return fastdom.write(() => {
        menuEl.classList.remove('is-active');
        menuEl.setAttribute('aria-hidden', true);
        buttonEl.setAttribute('aria-expanded', false);
    });
}

const bindNavToggle = (buttonEl: HTMLElement): void => {

    buttonEl.addEventListener('click', () => {
        fastdom
            .read(
                () =>
                    document.getElementById(
                        buttonEl.attributes["aria-controls"].value
                    )
            )
            .then(menuEl => {
                const watchForOutsideClick = (ev) => {
                    if(!buttonEl.parentElement.contains(ev.target)) {
                        hideAccountMenu(buttonEl,menuEl);
                        window.removeEventListener('click', watchForOutsideClick);
                    }
                }
                showAccountMenu(buttonEl,menuEl);
                window.addEventListener('click', watchForOutsideClick);
            });
    });
};

const initHeader = (): void => {
    const loaders = [
        ['.js_identity-header__nav-toggle', bindNavToggle],
    ];
    loadEnhancers(loaders);
};

export { initHeader };
