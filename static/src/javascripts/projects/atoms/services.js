// @flow

// expose some frontend modules to atoms
// managed by the atoms team

import ophan from 'ophan/ng';
import fastdom from 'fastdom';
import { viewport } from './services/viewport';

// Need to pass in the API to native services, something that looks
// like this:
// {
//    ophan:    { record: function(obj) { ... } },
//    identity: { ... },
//    ...
// }

type FastdomAction = Function => void;

const promisify = (fdaction: FastdomAction) => (
    thunk: Function
): Promise<any> =>
    new Promise(resolve => {
        fdaction.call(fastdom, () => {
            resolve(thunk());
        });
    });

const services: Services = {
    ophan,
    dom: {
        write: promisify(fastdom.write),
        read: promisify(fastdom.read),
    },
    viewport,
};

export { services };
