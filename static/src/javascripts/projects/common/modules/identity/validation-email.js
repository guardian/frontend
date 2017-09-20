import bean from 'bean';
import bonzo from 'bonzo';
import mediator from 'lib/mediator';
import IdentityApi from 'common/modules/identity/api';

export default {
    init: function() {

        var $resendButton,
            resendButton = document.body.querySelector('.js-id-send-validation-email');

        if (resendButton) {
            $resendButton = bonzo(resendButton);
            bean.on(resendButton, 'click', function(event) {
                event.preventDefault();
                if (IdentityApi.isUserLoggedIn()) {
                    IdentityApi.sendValidationEmail().then(
                        function success(resp) {
                            if (resp.status === 'error') {
                                mediator.emit('module:identity:validation-email:fail');
                                $resendButton.innerHTML = 'An error occured, please click here to try again.';
                            } else {
                                mediator.emit('module:identity:validation-email:success');
                                $resendButton.replaceWith('<p>Sent. Please check your email and follow the link.</p>');
                            }
                        },
                        function fail() {
                            mediator.emit('module:identity:validation-email:fail');
                            $resendButton.innerHTML = 'An error occured, please click here to try again.';
                        }
                    );
                }
            });
        }
    }
}; // define
