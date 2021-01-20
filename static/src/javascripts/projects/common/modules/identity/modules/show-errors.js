import fastdom from 'lib/fastdom-promise';

const formErrorClassName = 'form__error';
const formErrorHolderClassName = 'js-errorHolder';

const genericErrorMessage = 'Sorry, something went wrong';

const errors = [];


const renderError = (error) =>
    fastdom
        .measure(() =>
            window.document.querySelector(`.${formErrorHolderClassName}`)
        )
        .then((errorHolderEl) =>
            fastdom.mutate(() => {
                const errorEl = document.createElement('div');
                errorEl.setAttribute('role', 'alert');
                errorEl.setAttribute('aria-live', 'polite');
                errorEl.innerHTML = `<p>${error.message}.${
                    error.times > 1 ? ` (${error.times} times)` : ``
                }</p>`;
                errorEl.className = formErrorClassName;
                errorHolderEl.appendChild(errorEl);

                switch (error.action) {
                    case 'reload': {
                        const reloadCtaEl = document.createElement('a');
                        reloadCtaEl.innerHTML = 'Refresh this page';
                        reloadCtaEl.onclick = () => {
                            window.location.reload();
                        };
                        errorEl.appendChild(reloadCtaEl);
                        break;
                    }
                    default: {
                        break;
                    }
                }
            })
        );

const renderList = () =>
    fastdom
        .measure(() =>
            window.document.querySelector(`.${formErrorHolderClassName}`)
        )
        .then((errorHolderEl) =>
            fastdom.mutate(() => {
                while (errorHolderEl.firstChild) {
                    errorHolderEl.removeChild(errorHolderEl.firstChild);
                }
            })
        )
        .then(() => Promise.all(errors.map(error => renderError(error))))
        .then(() => Promise.resolve());

export const reset = () => {
    errors.length = 0;
};

export const push = (error, action = 'none') => {
    const message =
        error instanceof Error && error.message
            ? error.message
            : genericErrorMessage;

    const isDupeIndex = errors.findIndex(
        (_) => _.message === message
    );

    if (isDupeIndex > -1) {
        errors.push({
            message,
            action,
            times: errors[isDupeIndex].times + 1,
        });
        errors.splice(isDupeIndex, 1);
    } else {
        errors.push({
            message,
            action,
            times: 1,
        });
    }

    return renderList();
};
