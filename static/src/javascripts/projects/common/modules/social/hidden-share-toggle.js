// @flow

import fastdom from 'lib/fastdom-promise';

const MORE_SELECTOR = '.js-social__item--more';
const CLOSE_SELECTOR = '.js-social__tray-close';
const HIDDEN_CLASS = 'social--hidden';

const getSecondaryShareMethods = (scope: HTMLElement): HTMLElement[] => [
    ...scope.getElementsByClassName('js-social__secondary'),
];

const toggleSecondaryMethods = (
    scope: HTMLElement,
    force: boolean = false
): void => {
    const hiddenMethods = getSecondaryShareMethods(scope);
    const more = scope.querySelector(MORE_SELECTOR);
    const close = scope.querySelector(CLOSE_SELECTOR);

    hiddenMethods.forEach(method => {
        fastdom.write(() => {
            method.classList.toggle(HIDDEN_CLASS, !force);
        });
    });

    fastdom.write(() => {
        if (more) {
            more.classList.toggle(HIDDEN_CLASS, force);
        }

        if (close) {
            close.classList.toggle(HIDDEN_CLASS, !force);
        }
    });
};

const hiddenShareToggle = (): void => {
    const initShare = (share: HTMLElement): void => {
        const more = share.querySelector(MORE_SELECTOR);
        const toggleVisibility = (event: Event): void => {
            const target: HTMLElement = (event.target: any);
            const listItem: HTMLElement = (target.parentNode: any);
            const targetIsMore =
                listItem.matches(MORE_SELECTOR) ||
                !!listItem.closest(MORE_SELECTOR);
            const targetIsClose =
                listItem.matches(CLOSE_SELECTOR) ||
                !!listItem.closest(CLOSE_SELECTOR);

            if (targetIsMore || targetIsClose) {
                event.preventDefault();

                toggleSecondaryMethods(share, targetIsMore);

                // the top social element requires some extra treatment
                if (share.classList.contains('social--top')) {
                    share.classList.toggle(
                        'social--expanded-top',
                        targetIsMore
                    );
                }
            }
        };

        share.addEventListener('click', toggleVisibility);

        if (more) {
            more.classList.remove(HIDDEN_CLASS);
        }
    };

    fastdom
        .read(() => document.getElementsByClassName('social'))
        .then(shares => [...shares].forEach(initShare));
};

export { hiddenShareToggle };
