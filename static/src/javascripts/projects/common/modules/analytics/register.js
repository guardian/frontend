/*
 *  The register module is used to measure whether a module was executed, how
 *  long it took, and whether an error was caught. The data is sent to Ophan.
 *
 *  The system is passive, and is typically used for modules which we want to
 *  run analytics over (eg. ab tests, enhancement).
 */
define([
    'common/utils/mediator',
    'common/modules/experiments/ab',
    'common/utils/_'
], function (
    mediator,
    ab,
    _
) {
    var register = [],
        startTime = Date.now();

    function begin(name) {
        register.push({
            name: name,
            status: 'unfinished'
        });
    }

    function end(name) {
        _.where(register, {name: name})
            .forEach(function (module) {
                module.status = 'completed';
                module.endTime = Date.now() - startTime + 'ms';
            });
    }

    function error(name) {
        _.where(register, {name: name})
            .forEach(function (module) {
                module.status = 'failed';
                module.endTime = Date.now() - startTime + 'ms';
            });
    }

    function sendEvent() {
        require(['ophan/ng'], function (ophan) {
            ophan.record({
                register: register,
                abTestRegister: ab.getAbLoggableObject()
            });
        });
    }

    function initialise() {
        mediator.on('register:begin', begin);
        mediator.on('register:end', end);
        mediator.on('register:error', error);

        window.setTimeout(sendEvent.bind(), 5000);
    }

    return {
        initialise: initialise,
        begin: begin,
        end: end,
        error: error
    };
});
