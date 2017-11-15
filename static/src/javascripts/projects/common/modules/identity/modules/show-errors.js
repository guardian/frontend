// @flow
import fastdom from 'lib/fastdom-promise';

const formErrorClassName = 'form__error';
const formErrorHolderClassName = 'js-errorHolder';

const genericErrorMessage = 'Sorry, something went wrong';

export const push = (error: any, action: string = 'none'): Promise<void> =>
    fastdom
        .read(() =>
            window.document.querySelector(`.${formErrorHolderClassName}`)
        )
        .then((errorHolderEl: HTMLElement) =>
            fastdom.write(() => {
                const errorEl = document.createElement('div');
                errorEl.innerHTML = `<p>${error.message
                    ? error.message
                    : genericErrorMessage}. </p>`;
                errorEl.className = formErrorClassName;
                errorHolderEl.appendChild(errorEl);

                if (action) {
                    switch (action) {
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
                }
            })
        );
