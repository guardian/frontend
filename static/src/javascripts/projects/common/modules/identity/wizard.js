// @flow
/* eslint-disable no-underscore-dangle, react/sort-comp */

import fastdom from 'lib/fastdom-promise';
import { scrollTo } from 'lib/scroller';

const completedClassname = 'manage-account-wizard--completed';
const pagerClassname = 'manage-account-wizard__controls-pager';
const stepClassname = 'manage-account-wizard__step';
const stepHiddenClassname = 'manage-account-wizard__step--hidden';
const stepOutClassname = 'manage-account-wizard__step--out';
const stepInClassname = 'manage-account-wizard__step--in';
const stepOutReverseClassname = 'manage-account-wizard__step--out-reverse';
const stepInReverseClassname = 'manage-account-wizard__step--in-reverse';
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
    newPosition: number
): Promise<void> =>
    fastdom
        .read(() => [
            wizardEl.getBoundingClientRect().top - 20,
            parseInt(
                wizardEl.dataset.position ? wizardEl.dataset.position : -1,
                10
            ),
            [...wizardEl.getElementsByClassName(stepClassname)],
        ])
        .then(
            (
                [
                    offsetTop: number,
                    currentPosition: number,
                    steps: Array<HTMLElement>,
                ]
            ) =>
                fastdom.write(() => {
                    if (newPosition < 0 || !steps[newPosition]) {
                        throw new Error('Invalid position');
                    }
                    if (currentPosition > -1 && window.scrollY > offsetTop) {
                        scrollTo(offsetTop, 250, 'linear');
                    }
                    const transitionClassnames = [
                        stepInClassname,
                        stepInReverseClassname,
                        stepOutClassname,
                        stepOutReverseClassname,
                    ];
                    steps.forEach((stepEl: HTMLElement, i: number) => {
                        switch (i) {
                            case newPosition:
                                stepEl.classList.remove(
                                    stepHiddenClassname,
                                    ...transitionClassnames
                                );
                                wizardEl.style.minHeight = `${stepEl.getBoundingClientRect()
                                    .height}px`;
                                if (currentPosition > -1) {
                                    stepEl.classList.add(
                                        currentPosition < newPosition
                                            ? stepInClassname
                                            : stepInReverseClassname
                                    );
                                }
                                break;
                            case currentPosition:
                                stepEl.classList.remove(
                                    ...transitionClassnames
                                );
                                stepEl.classList.add(
                                    ...[
                                        stepHiddenClassname,
                                        currentPosition < newPosition
                                            ? stepOutClassname
                                            : stepOutReverseClassname,
                                    ]
                                );
                                setTimeout(() => {
                                    stepEl.classList.remove(
                                        ...transitionClassnames
                                    );
                                }, 200);
                                break;
                            default:
                                stepEl.classList.add(stepHiddenClassname);
                                stepEl.classList.remove(
                                    ...transitionClassnames
                                );
                        }
                    });
                    wizardEl.dataset.length = steps.length.toString();
                    wizardEl.dataset.position = newPosition.toString();
                    updateCounter(wizardEl);
                })
        );

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
