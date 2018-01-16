// @flow
import { addEventListener } from 'lib/events';
import fastdom from 'lib/fastdom-promise';

import type { RegisterListeners } from 'commercial-control/modules/messenger';

type AdSpec = {
    scrollType: string,
    backgroundColour: string,
    backgroundImage: string,
    backgroundRepeat: string,
    backgroundPosition: string,
};

type SpecStyles = {
    backgroundColor: string,
    backgroundImage: string,
    backgroundRepeat: string,
    backgroundPosition: string,
};

type Background = {
    backgroundParent: HTMLElement,
    background: HTMLElement,
};

const getStylesFromSpec = (specs: AdSpec): SpecStyles =>
    Object.keys(specs).reduce((result, key) => {
        if (key !== 'scrollType') {
            result[key] = specs[key];
        }
        // Flow is love, Flow is Life! DFP has been passing us `backgroundColour`
        // all along, and the setting of this css prop has been silently failing
        if (key === 'backgroundColour') {
            result.backgroundColor = specs[key];
        }
        return result;
    }, {});

const setBackground = (specs: AdSpec, adSlot: Node): Promise<any> => {
    if (
        !specs ||
        !('backgroundImage' in specs) ||
        !('backgroundRepeat' in specs) ||
        !('backgroundPosition' in specs) ||
        !('scrollType' in specs) ||
        !(adSlot instanceof Element)
    ) {
        return Promise.resolve();
    }

    const specStyles: SpecStyles = getStylesFromSpec(specs);

    // check to see whether the parent div exists already, if so, jut alter the style
    const backgroundParentClass = 'creative__background-parent';
    const backgroundClass = 'creative__background';

    const maybeBackgroundParent = ((adSlot.getElementsByClassName(
        backgroundParentClass
    ): any): HTMLCollection<HTMLElement>)[0];
    const maybeBackground = maybeBackgroundParent
        ? ((maybeBackgroundParent.getElementsByClassName(
              backgroundClass
          ): any): HTMLCollection<HTMLElement>)[0]
        : null;
    const backgroundAlreadyExists = !!(
        maybeBackgroundParent && maybeBackground
    );

    const getBackground = (): Promise<Background> => {
        if (
            maybeBackground &&
            maybeBackgroundParent &&
            backgroundAlreadyExists
        ) {
            return Promise.resolve({
                backgroundParent: maybeBackgroundParent,
                background: maybeBackground,
            });
        }
        // Wrap the background image in a DIV for positioning. Also, we give
        // this DIV a background colour if it is provided. This is because
        // if we set the background colour in the creative itself, the background
        // image won't be visible (think z-indexed layers)
        const backgroundParent = document.createElement('div');

        // Create an element to hold the background image
        const background = document.createElement('div');
        backgroundParent.appendChild(background);

        return fastdom
            .write(() => {
                if (backgroundParent) {
                    adSlot.insertBefore(backgroundParent, adSlot.firstChild);
                }
            })
            .then(() => ({ backgroundParent, background }));
    };

    const updateStyles = (
        backgroundParent: HTMLElement,
        background: HTMLElement
    ) => {
        backgroundParent.className = backgroundParentClass;
        background.className = `${backgroundClass} creative__background--${
            specs.scrollType
        }`;

        Object.assign(background.style, specStyles);

        if (specs.scrollType === 'fixed') {
            return fastdom
                .read(() => {
                    if (adSlot instanceof Element) {
                        return adSlot.getBoundingClientRect();
                    }
                })
                .then(rect =>
                    fastdom.write(() => {
                        if (specStyles.backgroundColor) {
                            backgroundParent.style.backgroundColor =
                                specStyles.backgroundColor;
                        }

                        if (rect) {
                            background.style.left = `${rect.left}px`;
                            background.style.right = `${rect.right}px`;
                            background.style.width = `${rect.width}px`;
                        }
                    })
                )
                .then(() => ({ backgroundParent, background }));
        }

        return Promise.resolve({ backgroundParent, background });
    };

    let updateQueued = false;

    const onScroll = (
        backgroundParent: HTMLElement,
        background: HTMLElement
    ) => {
        if (!updateQueued) {
            updateQueued = true;
            fastdom.read(() => {
                updateQueued = false;
                const rect = backgroundParent.getBoundingClientRect();
                const dy = Math.floor(0.3 * rect.top) + 20;

                // We update the style in a read batch because the DIV
                // has been promoted to its own layer and is also
                // strictly self-contained. Also, without doing that
                // the animation is extremely jittery.

                // #? Flow does not currently list backgroundPositionY in
                // CSSStyleDeclaration: https://github.com/facebook/flow/issues/396
                // ...So we have to use a more convoluted hack-around:
                (background.style: any).backgroundPositionY = `${dy}%`;
            });
        }
    };

    return getBackground()
        .then(({ backgroundParent, background }) =>
            updateStyles(backgroundParent, background)
        )
        .then(({ backgroundParent, background }) => {
            if (!backgroundAlreadyExists) {
                addEventListener(
                    window,
                    'scroll',
                    () => onScroll(backgroundParent, background),
                    {
                        passive: true,
                    }
                );

                onScroll(backgroundParent, background);
            }
        });
};

const init = (register: RegisterListeners): void => {
    register('background', (specs, ret, iframe): Promise<any> => {
        if (iframe && specs) {
            return setBackground(specs, iframe.closest('.js-ad-slot'));
        }
        return Promise.resolve();
    });
};

export const _ = { setBackground, getStylesFromSpec };

export { init };
