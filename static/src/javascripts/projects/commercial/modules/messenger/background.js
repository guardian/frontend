// @flow
import { addEventListener } from 'lib/events';
import fastdom from 'lib/fastdom-promise';

import type { RegisterListeners } from 'commercial/modules/messenger';

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
        !('scrollType' in specs)
    ) {
        return Promise.resolve();
    }

    const specStyles: SpecStyles = getStylesFromSpec(specs);

    // Create an element to hold the background image
    const background = document.createElement('div');
    background.className = `creative__background creative__background--${specs.scrollType}`;
    background.style = Object.assign(background.style, specStyles);

    // Wrap the background image in a DIV for positioning. Also, we give
    // this DIV a background colour if it is provided. This is because
    // if we set the background colour in the creative itself, the background
    // image won't be visible (think z-indexed layers)
    const backgroundParent = document.createElement('div');
    backgroundParent.className = 'creative__background-parent';
    if (specStyles.backgroundColor) {
        backgroundParent.style.backgroundColor = specStyles.backgroundColor;
    }
    backgroundParent.appendChild(background);

    if (specs.scrollType === 'fixed') {
        return fastdom.mutate(() => {
            adSlot.insertBefore(backgroundParent, adSlot.firstChild);
        });
    }
    let updateQueued = false;

    const onScroll = () => {
        if (!updateQueued) {
            updateQueued = true;
            fastdom.measure(() => {
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

    return fastdom
        .mutate(() => {
            adSlot.insertBefore(backgroundParent, adSlot.firstChild);
        })
        .then(() => {
            addEventListener(window, 'scroll', onScroll, {
                passive: true,
            });
            onScroll();
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
