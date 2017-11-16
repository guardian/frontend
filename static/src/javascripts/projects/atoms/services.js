// @flow

// expose some frontend modules to atoms
// managed by the atoms team

import ophan from 'ophan/ng';
import fastdom from 'lib/fastdom-promise';
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
        write: (f: () => void) => fastdom.write(f),
        read: <A>(f: () => A) => fastdom.read(f),
    },
    viewport,
};

export { services };
