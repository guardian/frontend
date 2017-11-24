// @flow

import reqwest from 'reqwest';
import fastdom from 'lib/fastdom-promise';
import loadEnhancers from './modules/loadEnhancers';

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

const enhanceEmailPrefs = (): void => {
    const loaders = [
        ['.js-save-button', bindHtmlPreferenceChange],
        ['.js-manage-account__modalCloser', bindModalCloser],
        ['.js-email-subscription__formatFieldsetToggle', toggleFormatModal],
    ];
    loadEnhancers(loaders);
};

export { enhanceEmailPrefs };
