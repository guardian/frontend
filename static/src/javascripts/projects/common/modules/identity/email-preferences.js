// @flow
// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh
// Hopefully this will be short-lived; if it is still alive in 2017, git blame and cry

import bean from 'bean';
import reqwest from 'reqwest';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';

const addUpdatingState = buttonEl => {
    fastdom.write(() => {
        buttonEl.disabled = true;
        $(buttonEl).addClass('is-updating is-updating-subscriptions');
    });
};

const generateFormQueryString = buttons => {
    const csrfToken = $('.form')[0].elements.csrfToken.value.toString();
    const htmlPreference = $('[name="htmlPreference"]:checked').val();
    let buttonString = '';
    for (let i = 0; i < buttons.length; i += 1) {
        const value = buttons[i].value;
        const unsubscribeMatches = value.match(/unsubscribe-(.*)/);
        if (unsubscribeMatches) {
            const listIds = unsubscribeMatches[1].split(',');
            for (let j = 0; j < listIds.length; j += 1) {
                buttonString += `removeEmailSubscriptions[]=${encodeURIComponent(
                    listIds[j]
                )}&`;
            }
        } else {
            buttonString += `addEmailSubscriptions[]=${encodeURIComponent(
                value
            )}&`;
        }
    }
    return `csrfToken=${encodeURIComponent(
        csrfToken
    )}&${buttonString}htmlPreference=${encodeURIComponent(htmlPreference)}`;
};

const clearErrorMessages = () => {
    if ($('.form__error')) {
        $.forEachElement('.form__error', errorEl => {
            errorEl.parentNode.removeChild(errorEl);
        });
    }
};

const renderErrorMessage = buttonEl =>
    fastdom.write(() => {
        clearErrorMessages();
        const errorMessage = $.create(
            '<div class="form__error">' +
                'Sorry, an error has occurred, please refresh the page and try again' +
                '</div>'
        );
        $(errorMessage).insertAfter(buttonEl.parentNode);
    });

const updateSubscriptionButton = buttonEl => {
    const buttonVal = buttonEl.value;
    const isSubscribing = !/unsubscribe/.test(buttonVal);

    if (isSubscribing) {
        fastdom.write(() => {
            $(buttonEl).removeClass('is-updating is-updating-subscriptions');
            buttonEl.value = `unsubscribe-${buttonVal}`;
            buttonEl.innerHTML = 'Unsubscribe';
            $($.ancestor(buttonEl, 'email-subscription')).addClass(
                'email-subscription--subscribed'
            );
            buttonEl.disabled = false;
        });
    } else {
        fastdom.write(() => {
            $(buttonEl).removeClass('is-updating is-updating-subscriptions');
            buttonEl.value = buttonVal.replace('unsubscribe-', '');
            buttonEl.innerHTML = 'Subscribe';
            $($.ancestor(buttonEl, 'email-subscription')).removeClass(
                'email-subscription--subscribed'
            );
            buttonEl.disabled = false;
        });
    }
};

const updateButton = buttonEl => {
    if ($(buttonEl).hasClass('js-subscription-button')) {
        updateSubscriptionButton(buttonEl);
    } else {
        fastdom.write(() => {
            setTimeout(() => {
                $(buttonEl).removeClass(
                    'is-updating is-updating-subscriptions'
                );
                buttonEl.disabled = false;
            }, 1000);
        });
    }
};

const resetUnsubscribeFromAll = buttonEl => {
    fastdom.write(() => {
        $(buttonEl).removeClass(
            'email-unsubscribe--confirm js-confirm-unsubscribe'
        );
        $('.js-unsubscribe--confirm').addClass('hide');
        $('.js-unsubscribe--basic').removeClass('hide');
    });
};

const reqwestEmailSubscriptionUpdate = buttonEl => {
    bean.on(buttonEl, 'click', () => {
        addUpdatingState(buttonEl);
        const formQueryString = generateFormQueryString([buttonEl]);
        reqwest({
            url: '/email-prefs',
            method: 'POST',
            data: formQueryString,
            error() {
                renderErrorMessage(buttonEl);
            },
            success() {
                updateButton(buttonEl);
            },
        });
    });
};

const reqwestUnsubscribeFromAll = (buttonEl, subscribedButtons) => {
    const formQueryString = generateFormQueryString(subscribedButtons);
    reqwest({
        url: '/email-prefs',
        method: 'POST',
        data: formQueryString,
        error() {
            renderErrorMessage(buttonEl);
        },
        success() {
            for (let i = 0; i < subscribedButtons.length; i += 1) {
                updateSubscriptionButton(subscribedButtons[i]);
            }
            updateButton(buttonEl);
        },
    });
};

const confirmUnsubscriptionFromAll = buttonEl => {
    fastdom.write(() => {
        $(buttonEl).addClass(
            'email-unsubscribe--confirm js-confirm-unsubscribe'
        );
        $('.email-unsubscribe-all__label').toggleClass('hide');
    });
};

const unsubscribeFromAll = buttonEl => {
    bean.on(buttonEl, 'click', () => {
        if ($(buttonEl).hasClass('js-confirm-unsubscribe')) {
            addUpdatingState(buttonEl);
            resetUnsubscribeFromAll(buttonEl);
            reqwestUnsubscribeFromAll(buttonEl, $('[value^="unsubscribe"]'));
        } else {
            confirmUnsubscriptionFromAll(buttonEl);
        }
    });
};

const toggleFormatFieldset = buttonEl => {
    bean.on(buttonEl, 'click', () => {
        fastdom.write(() => {
            $('.manage-account__modal--newsletterFormat')[0].classList.add(
                'manage-account__modal--active'
            );
        });
    });
};

const bindModalCloser = (buttonEl: HTMLElement): void => {
    bean.on(buttonEl, 'click', () => {
        const modalEl: ?Element = buttonEl.closest(
            '.manage-account__modal'
        );
        if (modalEl) {
            modalEl.classList.remove('manage-account__modal--active');
        }
    });
};

const submitPartialFormStatus = (params: Object = {}): Promise<void> =>
    new Promise(yay =>
        setTimeout(() => {
            yay(params);
        }, 500 + Math.random() * 500)
    );

const bindLabelFromSwitchboard = (labelEl: HTMLElement): void => {
    bean.on(labelEl, 'change', () => {
        Promise.all([
            fastdom.write(() => {
                if (document.body) {
                    document.body.classList.add('is-updating-cursor');
                }
                labelEl.classList.add('is-updating');
            }),
            submitPartialFormStatus(),
        ])
            .then(() => {
                fastdom
                    .write(() => {
                        if (document.body) {
                            document.body.classList.remove(
                                'is-updating-cursor'
                            );
                        }
                        labelEl.classList.add('is-just-updated');
                        labelEl.classList.remove('is-updating');
                    })
                    .then(
                        () =>
                            new Promise((accept: Function) => {
                                setTimeout(() => accept(), 1000);
                            })
                    )
                    .then(() =>
                        fastdom.write(() => {
                            labelEl.classList.remove('is-just-updated');
                        })
                    );
            })
            .catch((error: Error) => {
                console.error(error);
            });
    });
};

const enhanceEmailPreferences = (): void => {
    $.forEachElement('.js-subscription-button', reqwestEmailSubscriptionUpdate);
    $.forEachElement('.js-save-button', reqwestEmailSubscriptionUpdate);
    $.forEachElement('.js-unsubscribe', unsubscribeFromAll);
    $.forEachElement(
        '.js-email-subscription__formatFieldsetToggle',
        toggleFormatFieldset
    );
    $.forEachElement('.js-manage-account__modalCloser', bindModalCloser);
    $.forEachElement(
        '.js-mydata-prefs-switchboardLabel',
        bindLabelFromSwitchboard
    );
};

export { enhanceEmailPreferences };
