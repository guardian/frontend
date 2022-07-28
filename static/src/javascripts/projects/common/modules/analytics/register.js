/*
 *  The register module is used to measure whether a module was executed, how
 *  long it took, and whether an error was caught. The data is sent to Ophan.
 *
 *  The system is passive, and is typically used for modules which we want to
 *  run analytics over (eg. ab tests, enhancement).
 */

import { mediator } from 'lib/mediator';
import ophan from 'ophan/ng';

const register = [];
const startTime = Date.now();

const begin = (name) => {
    register.push({
        name,
        status: 'unfinished',
    });
};

const end = (name) => {
    register
        .filter(_ => _.name === name)
        .forEach(module => {
            module.status = 'completed';
            module.endTime = `${Date.now() - startTime}ms`;
        });
};

const error = (name) => {
    register
        .filter(_ => _.name === name)
        .forEach(module => {
            module.status = 'failed';
            module.endTime = `${Date.now() - startTime}ms`;
        });
};

const sendEvent = () => {
    ophan.record({
        register,
    });
};

const initAnalyticsRegister = () => {
    mediator.on('register:begin', begin);
    mediator.on('register:end', end);
    mediator.on('register:error', error);

    window.setTimeout(sendEvent, 5000);
};

export { initAnalyticsRegister, begin, end, error };
