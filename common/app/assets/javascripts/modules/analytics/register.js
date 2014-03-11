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
            status: "unfinished"
        });
    }

    function end(name) {
        _where(register, {name: name})
        .forEach(function(module){
            module.status = "completed";
            module.loadTime = Date.now() - startTime + "ms";
        });
    }

    function initialise() {
        deferToLoadEvent(function() {
            require('ophan/ng', function (ophan) {
                ophan.record({'register': register});
            });
        });
    }

    return {
        initialise: initialise,
        begin: begin,
        end: end
    };
});
