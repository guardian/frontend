// @flow
/* eslint-disable no-underscore-dangle, react/sort-comp */

import fastdom from 'lib/fastdom-promise';

const completedClassname = 'manage-account-wizard--completed';
const pagerClassname = 'manage-account-wizard__controls-pager';
const stepClassname = 'manage-account-wizard__step';
const nextButtonElClassname = 'js-manage-account-wizard__next';
const prevButtonElClassname = 'js-manage-account-wizard__prev';
const containerClassname = 'manage-account-wizard';

const updateCounter = (wizardEl: HTMLElement): Promise<void> =>
    fastdom
        .read(() => [...wizardEl.getElementsByClassName(pagerClassname)])
        .then((pagerEls: Array<HTMLElement>) =>
            fastdom.write(() => {
                wizardEl.classList.toggle(
                    completedClassname,
                    parseInt(wizardEl.dataset.position, 10) >=
                        parseInt(wizardEl.dataset.length, 10) - 1
                );
                pagerEls.forEach((pagerEl: HTMLElement) => {
                    pagerEl.innerText = `${parseInt(
                        wizardEl.dataset.position,
                        10
                    ) + 1} / ${wizardEl.dataset.length}`;
                });
            })
        );

export const setPosition = (
    wizardEl: HTMLElement,
    positionAt: number
): Promise<void> =>
    fastdom
        .read(() => [...wizardEl.getElementsByClassName(stepClassname)])
        .then((steps: Array<HTMLElement>) =>
            fastdom.write(() => {
                wizardEl.dataset.length = steps.length.toString();
                if (positionAt < 0 || !steps[positionAt]) {
                    throw new Error('Invalid position');
                }
                steps.forEach(stepEl => {
                    stepEl.style.display = 'none';
                });
                wizardEl.dataset.position = positionAt.toString();
                steps[positionAt].style.display = 'block';
                updateCounter(wizardEl);
            })
        )
        .catch(() => setPosition(wizardEl, 0));

export const enhance = (wizardEl: HTMLElement): Promise<void> =>
    setPosition(wizardEl, 0).then(() =>
        wizardEl.addEventListener('click', (ev: Event) => {
            if (
                ev.target instanceof HTMLElement &&
                ev.target.closest(`.${nextButtonElClassname}`)
            ) {
                setPosition(
                    wizardEl,
                    parseInt(wizardEl.dataset.position, 10) + 1
                );
            }
            if (
                ev.target instanceof HTMLElement &&
                ev.target.closest(`.${prevButtonElClassname}`)
            ) {
                setPosition(
                    wizardEl,
                    parseInt(wizardEl.dataset.position, 10) - 1
                );
            }
        })
    );

export { containerClassname };
