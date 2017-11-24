// @flow
// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh
// Hopefully this will be short-lived; if it is still alive in 2017, git blame and cry

import bean from 'bean';
import reqwest from 'reqwest';
import fastdom from 'lib/fastdom-promise';
import { _ as robust } from 'lib/robust';
import { push as pushError } from './modules/show-errors';
import {
    addSpinner,
    removeSpinner,
    flip as flipCheckbox,
    getInfo as getCheckboxInfo,
} from './modules/switch';
import { addUpdatingState, removeUpdatingState } from './modules/button';

const ERR_IDENTITY_HTML_PREF_NOT_FOUND = `Can't find HTML preference`;

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

        if (!closestFormEl) throw new Error(ERR_IDENTITY_HTML_PREF_NOT_FOUND);

        const inputEls: Array<HTMLInputElement> = ([
            ...closestFormEl.querySelectorAll('[name="htmlPreference"]'),
        ]: Array<any>).filter(el => el instanceof HTMLInputElement);

        /*
        loop over radio/checkbox-like fields first
        to avoid submitting the wrong one
        */

        const checkedInputEl: ?HTMLInputElement = inputEls.find(
            (inputEl: HTMLInputElement) => inputEl && inputEl.checked
        );

        if (checkedInputEl && checkedInputEl.value) {
            return checkedInputEl.value;
        } else if (inputEls[0] && inputEls[0].value) {
            return inputEls[0].value;
        }

        throw new Error(ERR_IDENTITY_HTML_PREF_NOT_FOUND);
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

const resetUnsubscribeFromAll = (buttonEl: HTMLButtonElement) =>
    fastdom
        .read(() => [
            [...document.querySelectorAll('.js-unsubscribe--confirm')],
            [...document.querySelectorAll('.js-unsubscribe--basic')],
        ])
        .then(([confirmEls, basicEls]) =>
            fastdom.write(() => {
                [
                    'email-unsubscribe--confirm',
                    'js-confirm-unsubscribe',
                ].forEach(classname => buttonEl.classList.remove(classname));
                confirmEls.forEach(confirmEl =>
                    confirmEl.classList.add('hide')
                );
                basicEls.forEach(basicEl => basicEl.classList.remove('hide'));
            })
        );

const confirmUnsubscriptionFromAll = (buttonEl: HTMLButtonElement) =>
    fastdom
        .read(() => [
            [...document.querySelectorAll('.email-unsubscribe-all__label')],
        ])
        .then(([unsubAllLabelEls]) =>
            fastdom.write(() => {
                [
                    'email-unsubscribe--confirm',
                    'js-confirm-unsubscribe',
                ].forEach(classname => buttonEl.classList.add(classname));
                unsubAllLabelEls.forEach(unsubAllLabelEl =>
                    unsubAllLabelEl.classList.toggle('hide')
                );
            })
        );

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

const bindUnsubscribeFromAll = (buttonEl: HTMLButtonElement) => {
    bean.on(buttonEl, 'click', () => {
        if (buttonEl.classList.contains('js-confirm-unsubscribe')) {
            addUpdatingState(buttonEl);
            resetUnsubscribeFromAll(buttonEl);

            getNewsletterHtmlPreferenceFromElement(buttonEl)
                .catch((error: Error) => {
                    if (error.message === ERR_IDENTITY_HTML_PREF_NOT_FOUND) {
                        return 'HTML';
                    }

                    throw error;
                })
                .then((htmlPreference: string) =>
                    Promise.all([
                        htmlPreference,
                        fastdom
                            .read(() => [
                                ...document.querySelectorAll(
                                    '.js-manage-account__newsletterCheckbox input:checked'
                                ),
                            ])
                            .then(checkboxes => {
                                const subscribedNewsletterIds = [];
                                checkboxes.forEach(inputEl => {
                                    subscribedNewsletterIds.push(inputEl.name);
                                    inputEl.checked = false;
                                });
                                return subscribedNewsletterIds;
                            }),
                        getCsrfTokenFromElement(
                            document.querySelector('.js-manage-account__newsletterCheckbox')
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
                    if (error.message === ERR_IDENTITY_HTML_PREF_NOT_FOUND) {
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
        fastdom.read(()=>
            document.querySelector('.manage-account__modal--newsletterFormat')
        ).then(modalEl=>{
            fastdom.write(() => {
                modalEl.classList.add(
                    'manage-account__modal--active'
                );
            });
        })
    });
};

const bindAjaxFormEventOverride = (formEl: HTMLFormElement): void => {
    formEl.addEventListener('submit', (ev: Event) => {
        ev.preventDefault();
    });
};

const enhanceManageAccount = (): void => {
    const loaders = [
        ['.js-save-button', bindHtmlPreferenceChange],
        ['.js-unsubscribe', bindUnsubscribeFromAll],
        ['.js-manage-account__ajaxForm', bindAjaxFormEventOverride],
        ['.js-manage-account__modalCloser', bindModalCloser],
        ['.js-manage-account__consentCheckbox', bindConsentSwitch],
        ['.js-email-subscription__formatFieldsetToggle', toggleFormatModal],
        ['.js-manage-account__newsletterCheckbox', bindNewsletterSwitch],
        [
            '.js-manage-account__consentCheckboxesSubmit',
            (el: HTMLElement) => el.remove(),
        ],
    ];

    /* ugly :any that saves a lot of loader complexity */

    loaders.forEach(([classname: string, action: Function]) => {
        [...document.querySelectorAll(classname)].forEach((element: any) => {
            robust.catchAndLogError(classname, () => {
                action(element);
            });
        });
    });
};

export { enhanceManageAccount };
