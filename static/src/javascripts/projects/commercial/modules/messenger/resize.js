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

const resize = (
    specs: Specs,
    iframe: HTMLElement,
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

    if (specs.width) {
        styles.width = normalise(specs.width);
    }

    if (specs.height) {
        styles.height = normalise(specs.height);
    }

    return fastdom.mutate(() => {
        Object.assign(adSlot.style, styles);
        Object.assign(iframe.style, styles);
    });
};

const init = (register: RegisterListeners) => {
    register('resize', (specs, ret, iframe) => {
        if (iframe && specs) {
            const adSlot = iframe && iframe.closest('.js-ad-slot');
            return resize(specs, iframe, adSlot);
        }
    });
};

export const _ = { resize, normalise };

export { init };
