// @flow
// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh
// Hopefully this will be short-lived; if it is still alive in 2017, git blame and cry

import reqwest from 'reqwest';
import fastdom from 'lib/fastdom-promise';
import { _ as robust } from 'lib/robust';
import { push as pushError } from './modules/show-errors';
import { addUpdatingState, removeUpdatingState } from './modules/button';
import {
    getCsrfTokenFromElement,
    getNewsletterHtmlPreferenceFromElement,
} from './modules/fetchFormFields';

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

const bindHtmlPreferenceChange = (buttonEl: HTMLButtonElement): void => {
    buttonEl.addEventListener('click', () =>
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

const bindModalCloser = (buttonEl: HTMLElement): void => {
    buttonEl.addEventListener('click', () => {
        const modalEl: ?Element = buttonEl.closest('.manage-account__modal');
        if (modalEl) {
            modalEl.classList.remove('manage-account__modal--active');
        }
    });
};

const toggleFormatModal = (buttonEl: HTMLElement): void => {
    buttonEl.addEventListener('click', () => {
        fastdom
            .read(() =>
                document.querySelector(
                    '.manage-account__modal--newsletterFormat'
                )
            )
            .then(modalEl => {
                fastdom.write(() => {
                    modalEl.classList.add('manage-account__modal--active');
                });
            });
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
        ['.js-manage-account__ajaxForm', bindAjaxFormEventOverride],
        [
            '.js-manage-account__consentCheckboxesSubmit',
            (el: HTMLElement) => el.remove(),
        ],
        ['.js-manage-account__modalCloser', bindModalCloser],
        ['.js-email-subscription__formatFieldsetToggle', toggleFormatModal],
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
