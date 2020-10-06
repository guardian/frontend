// @flow
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import {
    isUserLoggedIn,
    sendValidationEmail,
} from 'common/modules/identity/api';

const init = (): void => {
    fastdom
        .measure(() =>
            document.getElementsByClassName('js-id-send-validation-email')
        )
        .then(elems => {
            if (elems.length) {
                const resendButton = elems[0];

                resendButton.addEventListener(
                    'click',
                    (event: Event): void => {
                        event.preventDefault();

                        if (isUserLoggedIn()) {
                            sendValidationEmail().then(
                                resp => {
                                    if (resp.status === 'error') {
                                        mediator.emit(
                                            'module:identity:validation-email:fail'
                                        );

                                        fastdom.write(() => {
                                            resendButton.innerHTML =
                                                'An error occured, please click here to try again.';
                                        });
                                    } else {
                                        mediator.emit(
                                            'module:identity:validation-email:success'
                                        );

                                        const resendButtonParent =
                                            resendButton.parentNode;

                                        if (resendButtonParent) {
                                            const sentMsgEl = document.createElement(
                                                'p'
                                            );

                                            sentMsgEl.innerText =
                                                'Sent. Please check your email and follow the link.';

                                            fastdom.write(() => {
                                                resendButtonParent.replaceChild(
                                                    sentMsgEl,
                                                    resendButton
                                                );
                                            });
                                        }
                                    }
                                },
                                () => {
                                    mediator.emit(
                                        'module:identity:validation-email:fail'
                                    );

                                    fastdom.write(() => {
                                        resendButton.innerHTML =
                                            'An error occured, please click here to try again.';
                                    });
                                }
                            );
                        }
                    }
                );
            }
        });
};

export { init };
