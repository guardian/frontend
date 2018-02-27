// @flow

import reqwest from 'reqwest';
import loadEnhancers from './modules/loadEnhancers';

import { show as showModal } from './modules/modal';
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

const modalFormatToggle = (buttonEl: HTMLElement): void => {
    buttonEl.addEventListener('click', () => showModal('newsletterFormat'));
};

const enhanceEmailPrefs = (): void => {
    const loaders = [
        ['.js-save-button', bindHtmlPreferenceChange],
        ['.js-email-subscription__formatFieldsetToggle', modalFormatToggle],
    ];
    loadEnhancers(loaders);
};

export { enhanceEmailPrefs };
