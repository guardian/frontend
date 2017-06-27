// @flow
import fastdom from 'lib/fastdom-promise';

const setType = (type: ?string, adSlot: any) =>
    fastdom.write(() => {
        adSlot.classList.add(`ad-slot--${type || ''}`);
    });

export { setType };
