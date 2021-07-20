import { amIUsed } from 'commercial/sentinel';
import { hideElement } from '../hide-element';

const init = (register) => {
    register('hide', (specs, ret, iframe) => {
        amIUsed('hide', 'init', { nested_function_name: 'register' });
        if (iframe) {
            amIUsed('hide', 'init', { nested_function_name: 'register', iframe: 'truthy' });
            const adSlot = iframe.closest('.js-ad-slot');

            if (adSlot) {
                amIUsed('hide', 'init', { nested_function_name: 'register', adSlot: 'truthy' });
                return hideElement(adSlot);
            }
        }
    });
};

export { init };
