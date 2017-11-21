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
                    parseInt(wizardEl.dataset.position, 10) >= parseInt(wizardEl.dataset.length) - 1
                );
                pagerEls.forEach((pagerEl: HTMLElement) => {
                    pagerEl.innerText = `${parseInt(wizardEl.dataset.position, 10) +
                        1} / ${wizardEl.dataset.length}`;
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
                steps.forEach(stepEl => {
                    stepEl.style.display = 'none';
                });
                if (positionAt < 0) {
                    return setPosition(wizardEl, 0);
                }
                if (steps[positionAt]) {
                    wizardEl.dataset.position = positionAt.toString();
                    steps[positionAt].style.display = 'block';
                    updateCounter(wizardEl);
                } else {
                    steps[parseInt(wizardEl.dataset.position, 10)].style.display = 'block';
                    throw new Error('Invalid position');
                }
            })
        );

export const enhance = (wizardEl: HTMLElement): Promise<void> =>
    setPosition(wizardEl, 0).then(() =>
        fastdom.read(() => {
            const nextButtonEls = [
                ...wizardEl.getElementsByClassName(nextButtonElClassname),
            ];
            const prevButtonEls = [
                ...wizardEl.getElementsByClassName(prevButtonElClassname),
            ];

            if (nextButtonEls) {
                nextButtonEls.forEach(elem => {
                    elem.addEventListener('click', () => {
                        setPosition(
                            wizardEl,
                            parseInt(wizardEl.dataset.position, 10) + 1
                        );
                    });
                });
            }
            if (prevButtonEls) {
                prevButtonEls.forEach(elem => {
                    elem.addEventListener('click', () => {
                        setPosition(
                            wizardEl,
                            parseInt(wizardEl.dataset.position, 10) - 1
                        );
                    });
                });
            }
        })
    );

export { containerClassname };
