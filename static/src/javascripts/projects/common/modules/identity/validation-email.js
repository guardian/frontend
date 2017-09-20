// @flow

import mediator from 'lib/mediator';
import IdentityApi from 'common/modules/identity/api';

const init = (): void => {
    const resendButton = document.getElementsByClassName(
        'js-id-send-validation-email'
    )[0];

    if (resendButton) {
        resendButton.addEventListener('click', (event: Event): void => {
            event.preventDefault();

            if (IdentityApi.isUserLoggedIn()) {
                IdentityApi.sendValidationEmail().then(
                    resp => {
                        if (resp.status === 'error') {
                            mediator.emit(
                                'module:identity:validation-email:fail'
                            );
                            resendButton.innerHTML =
                                'An error occured, please click here to try again.';
                        } else {
                            mediator.emit(
                                'module:identity:validation-email:success'
                            );
                            const resendButtonParent = resendButton.parentNode;
                            if (resendButtonParent) {
                                const sentMsgEl = document.createElement('p');
                                sentMsgEl.innerText =
                                    'Sent. Please check your email and follow the link.';
                                resendButtonParent.replaceChild(
                                    sentMsgEl,
                                    resendButton
                                );
                            }
                        }
                    },
                    () => {
                        mediator.emit('module:identity:validation-email:fail');
                        resendButton.innerHTML =
                            'An error occured, please click here to try again.';
                    }
                );
            }
        });
    }
};

export { init };
