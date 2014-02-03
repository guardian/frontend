define([
    'bean',
    'bonzo',
    'common/utils/mediator',
    'common/modules/identity/api'
], function(
    bean,
    bonzo,
    mediator,
    IdentityApi
) {

    return {
        init: function (context) {

            var resendButton = context.querySelector('.js-id-send-validation-email');

            if (resendButton) {
                var $resendButton = bonzo(resendButton);
                bean.on(resendButton, 'click', function (event) {
                    event.preventDefault();
                    if(IdentityApi.isUserLoggedIn()) {
                        IdentityApi.sendValidationEmail().then(
                            function success (resp) {
                                if (resp.status === 'error') {
                                    mediator.emit('module:identity:validation-email:fail');
                                    $resendButton.innerHTML = "An error occured, please click here to try again.";
                                } else {
                                    mediator.emit('module:identity:validation-email:success');
                                    $resendButton.replaceWith("<p>Sent. Please check your email and follow the link.</p>");
                                }
                            },
                            function fail (err, resp) {
                                mediator.emit('module:identity:validation-email:fail');
                                $resendButton.innerHTML = "An error occured, please click here to try again.";
                            }
                        );
                    }
                });
            }
        }
    };

}); // define