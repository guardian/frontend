// @flow
import fastdom from 'lib/fastdom-promise';

export const ERR_IDENTITY_HTML_PREF_NOT_FOUND = `Can't find HTML preference`;

export const getCsrfTokenFromElement = (
    originalEl: ?HTMLElement
): Promise<string> =>
    fastdom
        .read(() => {
            if (!originalEl) return Promise.reject();
            const closestFormEl: ?Element = originalEl.closest('form');
            if (closestFormEl) {
                return closestFormEl.querySelector('[name=csrfToken]');
            }

            return Promise.reject();
        })
        .then((csrfTokenEl: HTMLInputElement) => csrfTokenEl.value.toString());

export const getNewsletterHtmlPreferenceFromElement = (
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
