// @flow
import fastdom from 'lib/fastdom-promise';
import type { RegisterListeners } from 'commercial/modules/messenger';

type Specs = {
    width?: string,
    height?: string,
};

const normalise = (length: string): string => {
    const lengthRegexp = /^(\d+)(%|px|em|ex|ch|rem|vh|vw|vmin|vmax)?/;
    const defaultUnit = 'px';
    const matches = String(length).match(lengthRegexp);
    if (!matches) {
        return '';
    }
    return matches[1] + (matches[2] === undefined ? defaultUnit : matches[2]);
};

const isLiveBlogInlineAdSlot = (adSlot: ?HTMLElement): boolean =>
    !!adSlot && adSlot.classList.contains('ad-slot--liveblog-inline');

const resize = (
    specs: Specs,
    iframe: HTMLElement,
    iframeContainer: ?HTMLElement,
    adSlot: HTMLElement
): ?Promise<any> => {
    if (
        !specs ||
        !('height' in specs || 'width' in specs) ||
        !iframe ||
        !adSlot
    ) {
        return null;
    }

    const styles = {};

    if (specs.width && !isLiveBlogInlineAdSlot(adSlot)) {
        styles.width = normalise(specs.width);
    }

    if (specs.height) {
        styles.height = normalise(specs.height);
    }

    return fastdom.write(() => {
        Object.assign(adSlot.style, styles);
        Object.assign(iframe.style, styles);

        if (iframeContainer) {
            Object.assign(iframeContainer.style, styles);
        }
    });
};

// When an outstream resizes we want it to revert to its original styling
const removeAnyOutstreamClass = (adSlot: ?HTMLElement) => {
    fastdom.write(() => {
        if (adSlot) {
            adSlot.classList.remove('ad-slot--outstream');
        }
    });
};

const init = (register: RegisterListeners) => {
    register('resize', (specs, ret, iframe) => {
        if (iframe && specs) {
            const adSlot = iframe && iframe.closest('.js-ad-slot');

            if (
                adSlot &&
                (adSlot.classList.contains('ad-slot--mostpop') ||
                    adSlot.classList.contains('ad-slot--right') ||
                    adSlot.classList.contains('ad-slot--offset-right'))
            ) {
                // We ignore resize events (sent mainly by apnx)
                // for the mostpop (Most popular) slot
                // See https://trello.com/c/TtuGq6Iy
                return null;
            }
            removeAnyOutstreamClass(adSlot);
            const iframeContainer =
                iframe && iframe.closest('.ad-slot__content');
            return resize(specs, iframe, iframeContainer, adSlot);
        }
    });
};

export const _ = { resize, normalise };

export { init };
