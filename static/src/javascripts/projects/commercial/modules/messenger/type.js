import fastdom from 'lib/fastdom-promise';

const setType = (type, adSlot) =>
    fastdom.mutate(() => {
        adSlot.classList.add(`ad-slot--${type || ''}`);
    });
const init = (register) => {
    register('type', (specs, ret, iframe) =>
        setType(specs, iframe && iframe.closest('.js-ad-slot'))
    );
};
export { init };
