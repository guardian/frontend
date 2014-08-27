define([
    'common/utils/mediator'
], function(
    mediator
) {

    var ready = function (config, context) {
        mediator.emit('page:gallery:ready', config, context);
    };

    return {
        init: ready
    };

});
