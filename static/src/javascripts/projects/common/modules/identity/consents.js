// @flow

import reqwest from 'reqwest';
import debounce from 'debounce-promise';
import fastdom from 'lib/fastdom-promise';
import loadEnhancers from './modules/loadEnhancers';

import { push as pushError } from './modules/show-errors';
import {
    addSpinner,
    removeSpinner,
    flip as flipCheckbox,
    getInfo as getCheckboxInfo,
    bindAnalyticsEventsOnce as bindCheckboxAnalyticsEventsOnce,
} from './modules/switch';
import { addUpdatingState, removeUpdatingState } from './modules/button';
import {
    getCsrfTokenFromElement,
    getNewsletterHtmlPreferenceFromElement,
    ERR_IDENTITY_HTML_PREF_NOT_FOUND,
} from './modules/fetchFormFields';

const consentCheckboxClassName = 'js-manage-account__consentCheckbox';
const newsletterCheckboxClassName = 'js-manage-account__newsletterCheckbox';
const checkAllCheckboxClassName = 'js-manage-account__check-allCheckbox';
const checkAllIgnoreClassName = 'js-manage-account__check-allCheckbox__ignore';

const requestDebounceTimeout = 150;

const LC_CHECK_ALL = 'Select all';
const LC_UNCHECK_ALL = 'Deselect all';

const ERR_MALFORMED_HTML = 'Something went wrong';

const submitPartialConsentFormDebouncedRq: ({}) => Promise<void> = debounce(
    formData =>
        reqwest({
            url: '/privacy/edit-ajax',
            method: 'POST',
            data: formData,
        }),
    requestDebounceTimeout
);
const submitPartialConsentFormData = {};

const submitPartialConsentForm = (formData: {}): Promise<void> => {
    Object.assign(submitPartialConsentFormData, formData);
    return submitPartialConsentFormDebouncedRq(
        submitPartialConsentFormData
    ).then(() => {
        Object.keys(submitPartialConsentFormData).forEach(_ => {
            delete submitPartialConsentFormData[_];
        });
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

const buildFormDataForFields = (
    csrfToken: string,
    fields: NodeList<any> = new NodeList()
): {} => {
    const formData: { csrfToken: string } = {
        csrfToken,
    };
    [...fields].forEach((field: HTMLInputElement) => {
        switch (field.type) {
            case 'checkbox':
                formData[field.name] = field.checked.toString();
                break;
            default:
                formData[field.name] = field.value.toString();
                break;
        }
    });

    return formData;
};

const getInputFields = (labelEl: HTMLElement): Promise<NodeList<HTMLElement>> =>
    fastdom.read(() => labelEl.querySelectorAll('[name][value]'));

const resetUnsubscribeFromAll = (buttonEl: HTMLButtonElement): Promise<void> =>
    fastdom
        .read(() => [
            [...document.getElementsByClassName('js-unsubscribe--confirm')],
            [...document.getElementsByClassName('js-unsubscribe--basic')],
        ])
        .then(([confirmEls, basicEls]) =>
            fastdom.write(() => {
                /* TODO:simplify this once classList.remove() is fixed */
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

const confirmUnsubscriptionFromAll = (
    buttonEl: HTMLButtonElement
): Promise<void> =>
    fastdom
        .read(() => [
            [
                ...document.getElementsByClassName(
                    'email-unsubscribe-all__label'
                ),
            ],
        ])
        .then(([unsubAllLabelEls]) =>
            fastdom.write(() => {
                /* TODO:simplify this once classList.remove() is fixed */
                [
                    'email-unsubscribe--confirm',
                    'js-confirm-unsubscribe',
                ].forEach(classname => buttonEl.classList.add(classname));
                unsubAllLabelEls.forEach(unsubAllLabelEl =>
                    unsubAllLabelEl.classList.toggle('hide')
                );
            })
        );

const bindUnsubscribeFromAll = (buttonEl: HTMLButtonElement) => {
    buttonEl.addEventListener('click', () => {
        if (buttonEl.classList.contains('js-confirm-unsubscribe')) {
            addUpdatingState(buttonEl);
            resetUnsubscribeFromAll(buttonEl);

            return Promise.all([
                getNewsletterHtmlPreferenceFromElement(buttonEl).catch(
                    (error: Error) => {
                        if (
                            error.message === ERR_IDENTITY_HTML_PREF_NOT_FOUND
                        ) {
                            return 'HTML';
                        }

                        throw error;
                    }
                ),
                fastdom
                    .read(() => [
                        ...document.querySelectorAll(
                            `.${newsletterCheckboxClassName} input:checked`
                        ),
                    ])
                    .then(checkboxes => {
                        checkboxes.forEach(inputEl => {
                            inputEl.checked = false;
                        });
                        return checkboxes.map(inputEl => inputEl.name);
                    }),
                getCsrfTokenFromElement(
                    document.getElementsByClassName(
                        newsletterCheckboxClassName
                    )[0]
                ),
            ])
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
        }
        confirmUnsubscriptionFromAll(buttonEl);
    });
};

const updateNewsletterSwitch = (labelEl: HTMLElement): Promise<void> =>
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

const bindNewsletterSwitch = (labelEl: HTMLElement): void => {
    getCheckboxInfo(labelEl).then(info => {
        if (info.shouldUpdate) {
            updateNewsletterSwitch(labelEl);
        }
    });

    labelEl.addEventListener(
        'change',
        (ev: Event, isNotUserInitiated: boolean = false) => {
            if (isNotUserInitiated) {
                return;
            }
            updateNewsletterSwitch(labelEl);
        },
        false
    );
};

const updateConsentSwitch = (labelEl: HTMLElement): Promise<void> =>
    Promise.all([
        getCsrfTokenFromElement(labelEl),
        getInputFields(labelEl),
        addSpinner(labelEl),
    ])
        .then(([token, fields]) => buildFormDataForFields(token, fields))
        .then((formData: {}) => submitPartialConsentForm(formData))
        .catch((err: Error) => {
            pushError(err, 'reload').then(() => {
                window.scrollTo(0, 0);
            });
            return flipCheckbox(labelEl);
        })
        .then(() => removeSpinner(labelEl));

const bindConsentSwitch = (labelEl: HTMLElement): void => {
    getCheckboxInfo(labelEl).then(info => {
        if (info.shouldUpdate) {
            updateConsentSwitch(labelEl);
        }
    });

    labelEl.addEventListener(
        'change',
        (ev: Event, isNotUserInitiated: boolean = false) => {
            if (isNotUserInitiated) {
                return;
            }
            updateConsentSwitch(labelEl);
        },
        false
    );
};

const getCheckedAllStatus = (checkboxesEl: HTMLInputElement[]): boolean =>
    checkboxesEl.reduce((acc, checkboxEl) => checkboxEl.checked && acc, true);

const bindCheckAllSwitch = (labelEl: HTMLElement): void => {
    const fetchElements = (): Promise<(HTMLInputElement | HTMLElement)[]> =>
        fastdom.read(() => [
            labelEl.querySelector('input'),
            labelEl.querySelector('.manage-account__switch-title'),
        ]);

    const fetchWrappedCheckboxes = (): Promise<HTMLInputElement[]> =>
        fastdom
            .read(() => [
                labelEl.dataset.wrapper
                    ? labelEl.dataset.wrapper
                    : '.manage-account__switches',
            ])
            .then(selector =>
                fastdom.read(() => {
                    const nearestWrapperEl = labelEl.closest(selector);
                    if (!nearestWrapperEl) throw new Error(ERR_MALFORMED_HTML);
                    return [
                        ...nearestWrapperEl.querySelectorAll(
                            'input[type=checkbox]'
                        ),
                    ].filter(
                        $checkbox =>
                            $checkbox.closest(
                                `.${checkAllCheckboxClassName}`
                            ) === null &&
                            $checkbox.closest(`.${checkAllIgnoreClassName}`) ===
                                null
                    );
                })
            );

    Promise.all([
        fetchElements(),
        fetchWrappedCheckboxes(),
        bindCheckboxAnalyticsEventsOnce(labelEl),
    ]).then(([[checkboxEl, titleEl], wrappedCheckboxEls]) => {
        const getTextForStatus = (status: boolean) =>
            status ? LC_UNCHECK_ALL : LC_CHECK_ALL;

        const updateCheckStatus = () =>
            fastdom.write(() => {
                if (!(checkboxEl instanceof HTMLInputElement)) {
                    throw new Error(ERR_MALFORMED_HTML);
                }
                checkboxEl.checked = getCheckedAllStatus(wrappedCheckboxEls);
                titleEl.innerHTML = getTextForStatus(checkboxEl.checked);
                labelEl.style.visibility = 'visible';
                labelEl.style.pointerEvents = 'all';
            });

        const handleChangeEvent = () => {
            addSpinner(labelEl, 9999)
                .then(() => new Promise(accept => setTimeout(accept, 300)))
                .then(() => removeSpinner(labelEl));
            wrappedCheckboxEls.forEach(wrappedCheckboxEl => {
                fastdom
                    .write(() => {
                        if (!(checkboxEl instanceof HTMLInputElement)) {
                            throw new Error(ERR_MALFORMED_HTML);
                        }
                        wrappedCheckboxEl.checked = checkboxEl.checked;
                    })
                    .then(() => {
                        wrappedCheckboxEl.dispatchEvent(
                            new Event('change', { bubbles: true })
                        );
                    });
            });
        };

        if (getCheckedAllStatus(wrappedCheckboxEls) === false) {
            updateCheckStatus();
        }

        wrappedCheckboxEls.forEach(wrappedCheckboxEl => {
            wrappedCheckboxEl.addEventListener('change', () =>
                updateCheckStatus()
            );
        });

        labelEl.addEventListener('change', () => handleChangeEvent());
    });
};

const enhanceConsents = (): void => {
    const loaders = [
        [`.${checkAllCheckboxClassName}`, bindCheckAllSwitch],
        [`.${consentCheckboxClassName}`, bindConsentSwitch],
        [`.${newsletterCheckboxClassName}`, bindNewsletterSwitch],
        ['.js-unsubscribe', bindUnsubscribeFromAll],
    ];
    loadEnhancers(loaders);
};

export {
    enhanceConsents,
    consentCheckboxClassName,
    newsletterCheckboxClassName,
};
