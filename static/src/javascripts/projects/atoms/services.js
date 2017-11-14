// @flow
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

const services: Services = {
    ophan,
    dom: {
        write: (f: () => void) => {
            fastdom.write(f);
        },
        read: (f: () => void) => {
            fastdom.read(f);
        },
    },
    viewport,
};

export { services };
