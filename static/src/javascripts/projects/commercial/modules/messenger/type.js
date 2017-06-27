// @flow
import fastdom from 'lib/fastdom-promise';
import { register } from 'commercial/modules/messenger';

const setType = (type: ?string, adSlot: any) =>
    fastdom.mutate(() => {
        adSlot.classList.add(`ad-slot--${type || ''}`);
    });

register('type', (specs: ?string, ret, iframe) =>
    setType(specs, iframe && iframe.closest('.js-ad-slot'))
);

export { setType };
