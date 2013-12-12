define([
    '$',
    'modules/identity/formstack',
    'utils/mediator'
], function(
    $,
    Formstack,
    mediator
) {

    var modules = {
            enhanceFormstack: function () {
                mediator.on('page:form:ready', function(config, context) {
                    var $form = $('[data-formstack-id]');
                    $form.each(function(el, a) {
                        new Formstack(el, context, config).init();
                    });
                });
            }
        },

        ready = function (config, context) {
            if (!this.initialised) {
                this.initialised = true;
                modules.enhanceFormstack();
            }
            mediator.emit('page:form:ready', config, context);
        };

    return {
        init: ready
    };

});
