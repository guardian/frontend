define([
    'common/utils/deferToLoad',
    'lodash/collections/where'

], function (
    deferToLoadEvent,
    _where
) {
    var modules = [];

    function begin(name) {
        modules.push({
            name: name,
            status: "unfinished"
        });
    }

    function end(name) {
        _where(modules, {name: name})
        .forEach(function(module){
            module.status = "completed";
        });
    }

    function initialise() {
        deferToLoadEvent(function() {
            require('ophan/ng', function (ophan) {
                ophan.record({'register': modules});
            });
        });
    }

    var register = {

        initialise: initialise,
        begin: begin,
        end: end
    };

    return register;
});
