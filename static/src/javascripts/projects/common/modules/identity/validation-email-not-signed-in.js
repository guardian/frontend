// @flow
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import fetch from 'lib/fetch';

const init = (): void => {
    fastdom
        .measure(() =>
            document.getElementsByClassName('js-id-send-validation-email-not-signed-in')
        )
        .then(elems => {
            if (elems.length) {
                const resendButton = elems[0];

                resendButton.addEventListener(
                    'click',
                    (event: Event): void => {
                        event.preventDefault();
                        let token = emailToken();
                        if (token) {
                            sendValidationEmail(token).then(
                                resp => {
                                    if (resp.status !== 200) {
                                        mediator.emit(
                                            'module:identity:validation-email:fail'
                                        );

                                        fastdom.mutate(() => {
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

                                            fastdom.mutate(() => {
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

                                    fastdom.mutate(() => {
                                        resendButton.innerHTML =
                                            'An error occured, please click here to try again.';
                                    });
                                }
                            );
                        } else {
                            fastdom.mutate(() => {
                                resendButton.innerHTML =
                                    'No token found';
                            });
                        }
                    }
                );
            }
        });
};

const emailToken = (): string => new URLSearchParams(window.location.search).get('encryptedEmail');

const sendValidationEmail = (token: string): any => {
    const endpoint = `/resend-validation-email/${token}`;
    return fetch(endpoint, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
};

export { init };
