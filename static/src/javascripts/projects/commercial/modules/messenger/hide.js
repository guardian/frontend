import { hideElement } from 'commercial/modules/hide-element';

const init = (register) => {
    register('hide', (specs, ret, iframe) => {
        if (iframe) {
            const adSlot = iframe.closest('.js-ad-slot');

            if (adSlot) {
                return hideElement(adSlot);
            }
        }
    });
};

export { init };
