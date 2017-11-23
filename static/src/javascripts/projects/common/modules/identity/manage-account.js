// @flow
// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh
// Hopefully this will be short-lived; if it is still alive in 2017, git blame and cry

import bean from 'bean';
import reqwest from 'reqwest';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
import { push as pushError } from './modules/show-errors';
import {
    addSpinner,
    removeSpinner,
    flip as flipCheckbox,
    getInfo as getCheckboxInfo,
} from './modules/switch';
import { addUpdatingState, removeUpdatingState } from './modules/button';

const ERR_HTML_PREF_NOT_FOUND = `Can't find HTML preference`;

const submitPartialFormStatus = (
    type: ?string = null,
    formData: FormData
): Promise<void> => {
    const url = (() => {
        switch (type) {
            case 'consent':
                return '/privacy/edit-ajax';
            default:
                throw new Error('Undefined form type');
        }
    })();

    return reqwest({
        url,
        method: 'POST',
        data: formData,
        processData: false,
    });
};

const getNewsletterHtmlPreferenceFromElement = (
    originalEl: HTMLElement
): Promise<string> =>
    fastdom.read(() => {
        const closestFormEl: ?Element = originalEl.closest('form');

        if (!closestFormEl) throw Error(ERR_HTML_PREF_NOT_FOUND);

        const checkboxEl: ?HTMLElement = closestFormEl.querySelector(
            '[name="htmlPreference"]:checked'
        );
        const inputEl: ?HTMLElement = closestFormEl.querySelector(
            '[name="htmlPreference"]'
        );

        if (checkboxEl && checkboxEl.value) {
            return checkboxEl.value;
        } else if (inputEl && inputEl.value) {
            return inputEl.value;
        }
        throw Error(ERR_HTML_PREF_NOT_FOUND);
    });

const submitNewsletterHtmlPreference = (
    csrfToken: string,
    htmlPreference: string
): Promise<void> => {
    const formData = new FormData();
    formData.append('csrfToken', csrfToken);
    formData.append('htmlPreference', htmlPreference);

    return reqwest({
        url: '/email-prefs',
        method: 'POST',
        data: formData,
        processData: false,
    });
};

const submitNewsletterAction = (
    csrfToken: string,
    htmlPreference: string,
    action: string = 'none',
    newsletters: Array<string> = []
): Promise<void> => {
    const formData = new FormData();
    formData.append('csrfToken', csrfToken);
    formData.append('htmlPreference', htmlPreference);

    switch (action) {
        case 'add':
            newsletters.map(id =>
                formData.append('addEmailSubscriptions[]', id)
            );
            break;
        case 'remove':
            newsletters.map(id =>
                formData.append('removeEmailSubscriptions[]', id)
            );
            break;
        default:
            throw new Error(`Undefined newsletter action type (${action})`);
    }

    return reqwest({
        url: '/email-prefs',
        method: 'POST',
        data: formData,
        processData: false,
    });
};

const getCsrfTokenFromElement = (originalEl: HTMLElement): Promise<any> =>
    fastdom
        .read(() => {
            const closestFormEl: ?Element = originalEl.closest('form');
            if (closestFormEl) {
                return closestFormEl.querySelector('*[name=csrfToken]');
            }

            return Promise.reject();
        })
        .then((csrfTokenEl: HTMLInputElement) => csrfTokenEl.value.toString());

const buildFormDataForFields = (
    csrfToken: string,
    fields: NodeList<any> = new NodeList()
): FormData => {
    const formData: FormData = new FormData();
    formData.append('csrfToken', csrfToken);
    fields.forEach((field: HTMLInputElement) => {
        switch (field.type) {
            case 'checkbox':
                formData.append(field.name, field.checked.toString());
                break;
            default:
                formData.append(field.name, field.value.toString());
                break;
        }
    });

    return formData;
};

const getInputFields = (labelEl: HTMLElement): Promise<NodeList<HTMLElement>> =>
    fastdom.read(() => labelEl.querySelectorAll('*[name][value]'));

const resetUnsubscribeFromAll = buttonEl => {
    fastdom.write(() => {
        $(buttonEl).removeClass(
            'email-unsubscribe--confirm js-confirm-unsubscribe'
        );
        $('.js-unsubscribe--confirm').addClass('hide');
        $('.js-unsubscribe--basic').removeClass('hide');
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

const bindHtmlPreferenceChange = (buttonEl: HTMLButtonElement): void => {
    bean.on(buttonEl, 'click', () =>
        Promise.all([
            getCsrfTokenFromElement(buttonEl),
            getNewsletterHtmlPreferenceFromElement(buttonEl),
            addUpdatingState(buttonEl),
        ])
            .then(([csrfToken: string, htmlPreference: string]) =>
                submitNewsletterHtmlPreference(csrfToken, htmlPreference)
            )
            .catch((err: Error) => {
                pushError(err, 'reload').then(() => {
                    window.scrollTo(0, 0);
                });
            })
            .then(() => {
                removeUpdatingState(buttonEl);
            })
    );
};

const bindUnsubscribeFromAll = (buttonEl: Element) => {
    bean.on(buttonEl, 'click', () => {
        if ($(buttonEl).hasClass('js-confirm-unsubscribe')) {
            addUpdatingState(buttonEl);
            resetUnsubscribeFromAll(buttonEl);

            getNewsletterHtmlPreferenceFromElement(buttonEl)
                .catch((error: Error) => {
                    if (error.message === ERR_HTML_PREF_NOT_FOUND) {
                        return 'HTML';
                    }

                    throw error;
                })
                .then((htmlPreference: string) =>
                    Promise.all([
                        htmlPreference,
                        fastdom.read(() => {
                            const subscribedNewsletterIds = [];
                            $(
                                '.js-manage-account__newsletterCheckbox input:checked'
                            ).each(inputEl => {
                                subscribedNewsletterIds.push(inputEl.name);
                                inputEl.checked = false;
                            });
                            return subscribedNewsletterIds;
                        }),
                        getCsrfTokenFromElement(
                            $('.js-manage-account__newsletterCheckbox').get(0)
                        ),
                    ])
                )
                .then(([htmlPreference, newsletterIds, csrfToken]) =>
                    submitNewsletterAction(
                        csrfToken,
                        htmlPreference,
                        'remove',
                        newsletterIds
                    )
                )
                .catch((err: Error) => {
                    pushError(err, 'reload').then(() => {
                        window.scrollTo(0, 0);
                    });
                })
                .then(() => {
                    removeUpdatingState(buttonEl);
                });
        } else {
            confirmUnsubscriptionFromAll(buttonEl);
        }
    });
};

const bindModalCloser = (buttonEl: HTMLElement): void => {
    bean.on(buttonEl, 'click', () => {
        const modalEl: ?Element = buttonEl.closest('.manage-account__modal');
        if (modalEl) {
            modalEl.classList.remove('manage-account__modal--active');
        }
    });
};

const bindNewsletterSwitch = (labelEl: HTMLElement): void => {
    bean.on(
        labelEl,
        'change',
        (ev: Event, isNotUserInitiated: boolean = false) => {
            if (isNotUserInitiated) {
                return;
            }
            getNewsletterHtmlPreferenceFromElement(labelEl)
                .catch((error: Error) => {
                    if (error.message === ERR_HTML_PREF_NOT_FOUND) {
                        return 'HTML';
                    }

                    throw error;
                })
                .then((htmlPreference: string) =>
                    Promise.all([
                        htmlPreference,
                        getCsrfTokenFromElement(labelEl),
                        getCheckboxInfo(labelEl),
                        addSpinner(labelEl),
                    ])
                )
                .then(([htmlPreference, token, info]) =>
                    submitNewsletterAction(
                        token,
                        htmlPreference,
                        info.checked ? 'add' : 'remove',
                        [info.name]
                    )
                )
                .catch((err: Error) => {
                    pushError(err, 'reload').then(() => {
                        window.scrollTo(0, 0);
                    });
                    return flipCheckbox(labelEl);
                })
                .then(() => removeSpinner(labelEl));
        },
        false
    );
};

const bindConsentSwitch = (labelEl: HTMLElement): void => {
    bean.on(
        labelEl,
        'change',
        (ev: Event, isNotUserInitiated: boolean = false) => {
            if (isNotUserInitiated) {
                return;
            }
            Promise.all([
                getCsrfTokenFromElement(labelEl),
                getInputFields(labelEl),
                addSpinner(labelEl),
            ])
                .then(([token, fields]) =>
                    buildFormDataForFields(token, fields)
                )
                .then((formData: FormData) =>
                    submitPartialFormStatus('consent', formData)
                )
                .catch((err: Error) => {
                    pushError(err, 'reload').then(() => {
                        window.scrollTo(0, 0);
                    });
                    return flipCheckbox(labelEl);
                })
                .then(() => removeSpinner(labelEl));
        },
        false
    );
};

const toggleFormatModal = (buttonEl: HTMLElement): void => {
    bean.on(buttonEl, 'click', () => {
        fastdom.write(() => {
            $('.manage-account__modal--newsletterFormat').addClass(
                'manage-account__modal--active'
            );
        });
    });
};

const bindAjaxFormEventOverride = (formEl: HTMLFormElement): void => {
    formEl.addEventListener('submit', (ev: Event) => {
        ev.preventDefault();
    });
};

const enhanceManageAccount = (): void => {
    $.forEachElement('.js-save-button', bindHtmlPreferenceChange);
    $.forEachElement('.js-unsubscribe', bindUnsubscribeFromAll);
    $.forEachElement('.js-manage-account__ajaxForm', bindAjaxFormEventOverride);
    $.forEachElement('.js-manage-account__modalCloser', bindModalCloser);
    $.forEachElement('.js-manage-account__consentCheckbox', bindConsentSwitch);
    $.forEachElement(
        '.js-email-subscription__formatFieldsetToggle',
        toggleFormatModal
    );
    $.forEachElement(
        '.js-manage-account__newsletterCheckbox',
        bindNewsletterSwitch
    );
    $.forEachElement(
        '.js-manage-account__consentCheckboxesSubmit',
        (el: HTMLElement) => el.remove()
    );
};

export { enhanceManageAccount };
