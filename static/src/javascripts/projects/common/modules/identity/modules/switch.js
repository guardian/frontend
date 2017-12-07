// @flow
import fastdom from 'lib/fastdom-promise';

const checkboxShouldUpdate = (
    checkedValue: boolean,
    originallyCheckedValue: string
): boolean => {
    if (
        (originallyCheckedValue === 'false' && checkedValue === true) ||
        (originallyCheckedValue === 'true' && checkedValue === false)
    ) {
        return true;
    }
    return false;
};

export const getInfo = (labelEl: HTMLElement): Promise<any> =>
    fastdom
        .read((): ?HTMLElement => labelEl.querySelector('input'))
        .then((checkboxEl: HTMLInputElement) => ({
            checked: checkboxEl.checked,
            name: checkboxEl.name,
            shouldUpdate: checkboxShouldUpdate(
                checkboxEl.checked,
                labelEl.dataset.originallyChecked
            ),
        }));

export const flip = (labelEl: HTMLElement): Promise<any> =>
    fastdom
        .read((): ?HTMLElement => labelEl.querySelector('input'))
        .then((checkboxEl: HTMLInputElement) => {
            fastdom.write(() => {
                checkboxEl.checked = !checkboxEl.checked;
            });
        });

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
