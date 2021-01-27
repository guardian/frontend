import { markTime } from 'lib/user-timing';

const init = (register) => {
    register('measure-ad-load', (specs) => {
        console.log("*** RECEIVED MEASURE AD LOAD EVENT ");
        console.log(specs);
        if (specs.slotId === 'top-above-nav') {
            markTime('topAboveNav Ad loaded')
        }
    });
}

export { init };
