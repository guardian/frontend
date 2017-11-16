// @flow
import fastdom from 'lib/fastdom-promise';

export const addSpinner = (labelEl: HTMLElement): Promise<any> =>
    fastdom.write(() => {
        if (document.body) {
            document.body.classList.add('is-updating-cursor');
        }
        labelEl.classList.add('is-updating');
    });

export const removeSpinner = (labelEl: HTMLElement): Promise<any> =>
    fastdom
        .write(() => {
            if (document.body) {
                document.body.classList.remove('is-updating-cursor');
            }
            labelEl.classList.add('is-just-updated');
            labelEl.classList.remove('is-updating');
        })
        .then(
            () =>
                new Promise((accept: () => void) => {
                    setTimeout(() => accept(), 1000);
                })
        )
        .then(() =>
            fastdom.write(() => {
                labelEl.classList.remove('is-just-updated');
            })
        );
