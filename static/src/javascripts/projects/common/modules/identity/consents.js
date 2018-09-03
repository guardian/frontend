// @flow

import reqwest from 'reqwest';
import fastdom from 'lib/fastdom-promise';
import config from 'lib/config';
import loadEnhancers from './modules/loadEnhancers';

import { push as pushError } from './modules/show-errors';
import {
    addSpinner,
    bindAnalyticsEventsOnce as bindCheckboxAnalyticsEventsOnce,
    flip as flipCheckbox,
    getInfo as getCheckboxInfo,
    removeSpinner,
} from './modules/switch';
import { getCsrfTokenFromElement } from './modules/fetchFormFields';

import { prependSuccessMessage } from './modules/prependMessage';

const consentCheckboxClassName = 'js-manage-account__consentCheckbox';
const newsletterCheckboxClassName = 'js-manage-account__newsletterCheckbox';
const checkAllCheckboxClassName = 'js-manage-account__check-allCheckbox';
const checkAllIgnoreClassName = 'js-manage-account__check-allCheckbox__ignore';
const unsubscribeButtonClassName = 'js-unsubscribe';
const isHiddenClassName = 'is-hidden';
const isLoadingClassName = 'loading';
const optOutClassName = 'fieldset__fields--opt-out';
const optInClassName = 'fieldset__fields--opt-in';

const LC_CHECK_ALL = 'Select all';
const LC_UNCHECK_ALL = 'Deselect all';
const UNSUBSCRIPTION_SUCCESS_MESSAGE =
    "You've been unsubscribed from all Guardian marketing newsletters and emails.";
const ERR_MALFORMED_HTML = 'Something went wrong';

const updateConsent = (consent: {
    id: string,
    consented: boolean,
}): Promise<void> =>
    reqwest({
        url: `${config.get('page.idApiUrl')}/users/me/consents`,
        method: 'PATCH',
        type: 'json',
        contentType: 'application/json',
        withCredentials: true,
        crossOrigin: true,
        data: JSON.stringify(consent),
    });

const submitNewsletterAction = (
    csrfToken: string,
    action: string = 'none',
    newsletters: Array<string> = []
): Promise<void> => {
    const formData = new FormData();
    formData.append('csrfToken', csrfToken);

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

const buildConsentUpdatePayload = (
    fields: NodeList<any> = new NodeList()
): { id: string, consented: boolean } => {
    const consent = {};
    [...fields].forEach((field: HTMLInputElement) => {
        switch (field.type) {
            case 'checkbox':
                consent.consented = field.checked;
                break;
            default:
                if (field.name.includes('.id')) {
                    consent.id = field.value;
                }
                break;
        }
    });

    return consent;
};

const getInputFields = (labelEl: HTMLElement): Promise<NodeList<HTMLElement>> =>
    fastdom.read(() => labelEl.querySelectorAll('[name][value]'));

const unsubscribeFromAll = (
    buttonEl: HTMLButtonElement,
    csrfToken: string
): Promise<void> => {
    buttonEl.classList.add(isLoadingClassName);
    return reqwest({
        url: `/user/email-subscriptions`,
        method: 'DELETE',
        withCredentials: true,
        headers: {
            'Csrf-Token': csrfToken,
        },
    });
};

const toggleInputsWithSelector = (className: string, checked: boolean) =>
    fastdom
        .read(() => [
            ...document.querySelectorAll(
                `.${className} input[type="checkbox"]`
            ),
        ])
        .then(boxes =>
            boxes.forEach(b => {
                b.checked = checked;
            })
        );

const checkAllOptOuts = (): Promise<void> =>
    toggleInputsWithSelector(optOutClassName, true);

const uncheckAllOptIns = (): Promise<void> =>
    toggleInputsWithSelector(optInClassName, false);

const showUnsubscribeConfirmation = (): Promise<void> => {
    const fetchButton = (): Promise<HTMLButtonElement> =>
        fastdom.read(() =>
            document.querySelector(`.${unsubscribeButtonClassName}`)
        );

    const updateVisibilityAndShowMessage = (
        elem: HTMLButtonElement
    ): Promise<void> =>
        fastdom.write(() => {
            if (elem.parentElement) {
                prependSuccessMessage(
                    UNSUBSCRIPTION_SUCCESS_MESSAGE,
                    elem.parentElement
                );
            }
            elem.classList.add(isHiddenClassName);
        });

    return fetchButton().then(button => updateVisibilityAndShowMessage(button));
};

const bindUnsubscribeFromAll = (buttonEl: HTMLButtonElement) => {
    buttonEl.addEventListener('click', () => {
        toggleInputsWithSelector(newsletterCheckboxClassName, false);
        return getCsrfTokenFromElement(
            document.getElementsByClassName(newsletterCheckboxClassName)[0]
        )
            .then(csrfToken => unsubscribeFromAll(buttonEl, csrfToken))
            .then(() =>
                Promise.all([
                    showUnsubscribeConfirmation(),
                    uncheckAllOptIns(),
                    checkAllOptOuts(),
                ])
            )
            .catch((err: Error) => {
                pushError(err, 'reload').then(() => {
                    window.scrollTo(0, 0);
                });
            });
    });
};

const updateNewsletterSwitch = (labelEl: HTMLElement): Promise<void> =>
    Promise.all([
        getCsrfTokenFromElement(labelEl),
        getCheckboxInfo(labelEl),
        addSpinner(labelEl),
    ])
        .then(([token, info]) =>
            submitNewsletterAction(token, info.checked ? 'add' : 'remove', [
                info.name,
            ])
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
    Promise.all([getInputFields(labelEl), addSpinner(labelEl)])
        .then(([fields]) => buildConsentUpdatePayload(fields))
        .then(consent => updateConsent(consent))
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
        [`.${unsubscribeButtonClassName}`, bindUnsubscribeFromAll],
    ];
    loadEnhancers(loaders);
};

export {
    enhanceConsents,
    consentCheckboxClassName,
    newsletterCheckboxClassName,
};
