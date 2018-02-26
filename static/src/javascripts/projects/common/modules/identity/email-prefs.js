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

const modalCloserBind = (buttonEl: HTMLElement): void => {
    buttonEl.addEventListener('click', () => {
        const modalEl: ?Element = buttonEl.closest('.identity-modal');
        if (modalEl) {
            modalEl.classList.remove('identity-modal--active');
        }
    });
};

const modalFormatToggle = (buttonEl: HTMLElement): void => {
    buttonEl.addEventListener('click', () => {
        fastdom
            .read(
                () =>
                    document.getElementsByClassName(
                        'identity-modal--newsletterFormat'
                    )[0]
            )
            .then(modalEl => {
                fastdom.write(() => {
                    modalEl.classList.add('identity-modal--active');
                });
            });
    });
};

const enhanceEmailPrefs = (): void => {
    const loaders = [
        ['.js-save-button', bindHtmlPreferenceChange],
        ['.js-identity-modal__closer', modalCloserBind],
        ['.js-email-subscription__formatFieldsetToggle', modalFormatToggle],
    ];
    loadEnhancers(loaders);
};

export { enhanceEmailPrefs };
