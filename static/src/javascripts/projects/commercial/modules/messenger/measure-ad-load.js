import { markTime } from 'lib/user-timing';

const init = (register) => {
    register('measure-ad-load', (specs) => {
        if (specs.slotId === 'top-above-nav') {
            markTime('topAboveNav Ad loaded')
        }
    });
}

export { init };
