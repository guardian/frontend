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
        write: fastdom.write,
        read: fastdom.read,
    },
    viewport,
};

export { services };
