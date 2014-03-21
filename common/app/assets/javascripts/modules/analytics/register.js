define([
    'common/utils/deferToLoad',
    'lodash/collections/where'

], function (
    deferToLoadEvent,
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

    function sendEvent() {
        require('ophan/ng', function (ophan) {
            ophan.record({'register': register});
        });
    }

    function initialise() {
        deferToLoadEvent(function() {
            window.setTimeout(sendEvent, 5000);
        });
    }

    return {
        initialise: initialise,
        begin: begin,
        end: end,
        error: error
    };
});
