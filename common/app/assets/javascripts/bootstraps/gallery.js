define([
    'common/utils/mediator',
    'bean'
], function(
    mediator,
    bean
) {

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
        }
        mediator.emit('page:gallery:ready', config, context);
        mediator.on('modules:overlay:hide', function() {
            bean.fire(document, 'resize');
        });
    };

    return {
        init: ready
    };

});
