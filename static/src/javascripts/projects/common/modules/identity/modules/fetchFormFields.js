// @flow
import fastdom from 'lib/fastdom-promise';

export const getCsrfTokenFromElement = (
    originalEl: ?HTMLElement
): Promise<string> =>
    fastdom
        .measure(() => {
            if (!originalEl) return Promise.reject();
            const closestFormEl: ?Element = originalEl.closest('form');
            if (closestFormEl) {
                return closestFormEl.querySelector('[name=csrfToken]');
            }

            return Promise.reject();
        })
        .then((csrfTokenEl: HTMLInputElement) => csrfTokenEl.value.toString());
