// @flow
import fastdom from 'lib/fastdom-promise';
import type { RegisterListeners } from 'commercial/modules/messenger';

const setType = (type: ?string, adSlot: any) =>
    fastdom.write(() => {
        adSlot.classList.add(`ad-slot--${type || ''}`);
    });
const init = (register: RegisterListeners) => {
    register('type', (specs: ?string, ret, iframe) =>
        setType(specs, iframe && iframe.closest('.js-ad-slot'))
    );
};
export { init };
