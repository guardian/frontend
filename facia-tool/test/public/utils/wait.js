import Promise from 'Promise';
import mediator from 'utils/mediator';

export function event (name, emitter) {
    return new Promise(resolve => {
        (emitter || mediator).once(name, resolve);
    });
}

export function ms (time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}
