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
} from './modules/switchboardLabel';
import { addUpdatingState, removeUpdatingState } from './modules/button';

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

const submitNewsletterAction = (
    csrfToken: string,
    action: string = 'none',
    newsletters: Array<string> = []
) => {
    const formData = new FormData();
    formData.append('csrfToken', csrfToken);
    formData.append(
        'htmlPreference',
        $('[name="htmlPreference"]:checked').val()
    );

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

const bindUnsubscribeFromAll = buttonEl => {
    bean.on(buttonEl, 'click', () => {
        if ($(buttonEl).hasClass('js-confirm-unsubscribe')) {
            addUpdatingState(buttonEl);
            resetUnsubscribeFromAll(buttonEl);

            Promise.all([
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
                .then(([newsletterIds, csrfToken]) =>
                    submitNewsletterAction(csrfToken, 'remove', newsletterIds)
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

const bindNewsletterLabelFromSwitchboard = (labelEl: HTMLElement): void => {
    bean.on(
        labelEl,
        'change',
        (ev: Event, isNotUserInitiated: boolean = false) => {
            if (isNotUserInitiated) {
                return;
            }
            Promise.all([
                getCsrfTokenFromElement(labelEl),
                getCheckboxInfo(labelEl),
                addSpinner(labelEl),
            ])
                .then(([token, info]) =>
                    submitNewsletterAction(
                        token,
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

const bindConsentLabelFromSwitchboard = (labelEl: HTMLElement): void => {
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

const enhanceManageAccount = (): void => {
    $.forEachElement('.js-unsubscribe', bindUnsubscribeFromAll);
    $.forEachElement('.js-manage-account__modalCloser', bindModalCloser);
    $.forEachElement(
        '.js-manage-account__consentCheckbox',
        bindConsentLabelFromSwitchboard
    );
    $.forEachElement(
        '.js-manage-account__newsletterCheckbox',
        bindNewsletterLabelFromSwitchboard
    );
    $.forEachElement(
        '.js-manage-account__consentCheckboxesSubmit',
        (el: HTMLElement) => el.remove()
    );
};

export { enhanceManageAccount };
