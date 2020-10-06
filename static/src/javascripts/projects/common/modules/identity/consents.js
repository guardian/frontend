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
import { prependSuccessMessage } from './modules/prependMessage';
import {
    buildNewsletterUpdatePayload,
    setConsent,
    updateNewsletter,
} from './api';
import type { SettableConsent } from './api';

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

const buildConsentUpdatePayload = (
    fields: NodeList<any> = new NodeList()
): SettableConsent => {
    const consent = {};
    Array.from(fields).forEach((field: HTMLInputElement) => {
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
    fastdom.measure(() => labelEl.querySelectorAll('[name][value]'));

const unsubscribeFromAll = (buttonEl: HTMLButtonElement): Promise<void> => {
    buttonEl.classList.add(isLoadingClassName);
    return reqwest({
        url: `${config.get('page.idApiUrl')}/remove/consent/all`,
        method: 'POST',
        withCredentials: true,
        crossOrigin: true,
    });
};

const toggleInputsWithSelector = (className: string, checked: boolean) =>
    fastdom
        .measure(() =>
            Array.from(
                document.querySelectorAll(
                    `.${className} input[type="checkbox"]`
                )
            )
        )
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
        fastdom.measure(() =>
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
        unsubscribeFromAll(buttonEl)
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
    Promise.all([getCheckboxInfo(labelEl), addSpinner(labelEl)])
        .then(([checkbox]) =>
            buildNewsletterUpdatePayload(
                checkbox.checked ? 'add' : 'remove',
                checkbox.name
            )
        )
        .then(newsletter => updateNewsletter(newsletter))
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
        .then(consent => setConsent([consent]))
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
        fastdom.measure(() => [
            labelEl.querySelector('input'),
            labelEl.querySelector('.manage-account__switch-title'),
        ]);

    const fetchWrappedCheckboxes = (): Promise<HTMLInputElement[]> =>
        fastdom
            .measure(() => [
                labelEl.dataset.wrapper
                    ? labelEl.dataset.wrapper
                    : '.manage-account__switches',
            ])
            .then(selector =>
                fastdom.measure(() => {
                    const nearestWrapperEl = labelEl.closest(selector);
                    if (!nearestWrapperEl) throw new Error(ERR_MALFORMED_HTML);
                    return Array.from(
                        nearestWrapperEl.querySelectorAll(
                            'input[type=checkbox]'
                        )
                    ).filter(
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
        if (!(checkboxEl instanceof HTMLInputElement)) {
            throw new Error(ERR_MALFORMED_HTML);
        }

        const getTextForStatus = (status: boolean) =>
            status ? LC_UNCHECK_ALL : LC_CHECK_ALL;

        const updateCheckStatus = () =>
            fastdom.write(() => {
                checkboxEl.checked = getCheckedAllStatus(wrappedCheckboxEls);
                titleEl.innerHTML = getTextForStatus(checkboxEl.checked);
                labelEl.style.visibility = 'visible';
                labelEl.style.pointerEvents = 'all';
            });

        const getInputFieldsFromCheckboxes = checkboxesToUpdate =>
            checkboxesToUpdate.map(checkboxElToUpdate => {
                const checkboxLabelEl = checkboxElToUpdate.labels[0];
                if (!(checkboxLabelEl instanceof HTMLLabelElement)) {
                    throw new Error(ERR_MALFORMED_HTML);
                }
                return getInputFields(checkboxLabelEl);
            });

        const handleChangeEvent = () => {
            addSpinner(labelEl, 9999)
                .then(() => new Promise(accept => setTimeout(accept, 300)))
                .then(() => removeSpinner(labelEl));

            const checkboxesToUpdate = wrappedCheckboxEls.filter(
                wrappedCheckboxEl =>
                    wrappedCheckboxEl.checked !== checkboxEl.checked
            );

            checkboxesToUpdate.forEach(wrappedCheckboxEl => {
                fastdom.write(() => {
                    wrappedCheckboxEl.checked = checkboxEl.checked;
                });
            });

            Promise.all(getInputFieldsFromCheckboxes(checkboxesToUpdate))
                .then(checkboxInputs =>
                    checkboxInputs.map(buildConsentUpdatePayload)
                )
                .then(setConsent);

            updateCheckStatus();
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
