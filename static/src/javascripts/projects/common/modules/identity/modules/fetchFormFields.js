import fastdom from 'lib/fastdom-promise';

export const getCsrfTokenFromElement = (
    originalEl
) =>
    fastdom
        .measure(() => {
            if (!originalEl) return Promise.reject();
            const closestFormEl = originalEl.closest('form');
            if (closestFormEl) {
                return closestFormEl.querySelector('[name=csrfToken]');
            }

            return Promise.reject();
        })
        .then((csrfTokenEl) => csrfTokenEl.value.toString());
