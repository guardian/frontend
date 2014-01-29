define([
    'bean',
    'common/utils/mediator',
    'common/modules/identity/api'
], function(
    bean,
    mediator,
    IdentityApi
) {

function init(context) {
    bean.on(context, 'click', '.js-id-send-validation-email', function(e) {
        e.preventDefault();
        IdentityApi.sendValidationEmail().then(
            function success(resp) {
                if (resp.status === 'error') {
                    mediator.emit('module:identity:validation-email:fail');
                } else {
                    mediator.emit('module:identity:validation-email:success');
                }
            },
            function fail(err, resp) {
                mediator.emit('module:identity:validation-email:fail');
            }
        );
    });
}

return { init: init };

}); // define