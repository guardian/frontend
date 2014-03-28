/*
 *  The register module is used to measure whether a module was executed, how
 *  long it took, and whether an error was caught. The data is sent to Ophan.
 *
 *  The system is passive, and is typically used for modules which we want to
 *  run analytics over (eg. ab tests, enhancement).
 */
define([
    'common/utils/deferToLoad',
    'common/modules/experiments/ab',
    'lodash/collections/where'

], function (
    deferToLoadEvent,
    ab,
    _where
) {
    var register = [];
    var startTime = Date.now();

    function begin(name) {
        register.push({
            name: name,
            status: 'unfinished'
        });
    }

    function end(name) {
        _where(register, {name: name})
            .forEach(function(module){
                module.status = 'completed';
                module.endTime = Date.now() - startTime + 'ms';
            });
    }

    function error(name) {
        _where(register, {name: name})
            .forEach(function(module){
                module.status = 'failed';
                module.endTime = Date.now() - startTime + 'ms';
            });
    }

    function sendEvent(config) {
        require('ophan/ng', function (ophan) {
            ophan.record({'register': register,
                          'abTestRegister': ab.getAbLoggableObject(config) });
        });
    }

    function initialise(config) {
        deferToLoadEvent(function() {
            window.setTimeout(sendEvent(config), 5000);
        });
    }

    return {
        initialise: initialise,
        begin: begin,
        end: end,
        error: error
    };
});
