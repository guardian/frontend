import type { RegisterListeners } from 'commercial/modules/messenger';
import fastdom from 'lib/fastdom-promise';

const setType = (type: string | null | undefined, adSlot: any) =>
    fastdom.mutate(() => {
        adSlot.classList.add(`ad-slot--${type || ''}`);
    });
const init = (register: RegisterListeners) => {
    register('type', (specs: string | null | undefined, ret, iframe) =>
        setType(specs, iframe && iframe.closest('.js-ad-slot'))
    );
};
export { init };
