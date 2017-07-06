// @flow
import fastdom from 'lib/fastdom-promise';
import type { RegisterListeners } from 'commercial/modules/messenger';

const hide = (adSlot: HTMLElement): ?Promise<any> => {
    if (!adSlot) {
        return null;
    }

    return fastdom.write(() => {
        adSlot.classList.add('u-h');
    });
};

const init = (register: RegisterListeners) => {
    register('hide', (specs, ret, iframe) => {
        if (iframe) {
            const adSlot = iframe && iframe.closest('.js-ad-slot');
            return hide(adSlot);
        }
    });
};

export { init };
