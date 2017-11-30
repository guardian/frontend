// @flow

import fastdom from 'lib/fastdom-promise';
import { scrollTo } from 'lib/scroller';

const completedClassname = 'manage-account-wizard--completed';
const pagerClassname = 'manage-account-wizard__controls-pager';
const nextButtonElClassname = 'js-manage-account-wizard__next';
const prevButtonElClassname = 'js-manage-account-wizard__prev';
const containerClassname = 'manage-account-wizard';

const stepClassname = 'manage-account-wizard__step';
const stepHiddenClassname = 'manage-account-wizard__step--hidden';
const stepOutClassname = 'manage-account-wizard__step--out';
const stepInClassname = 'manage-account-wizard__step--in';
const stepOutReverseClassname = 'manage-account-wizard__step--out-reverse';
const stepInReverseClassname = 'manage-account-wizard__step--in-reverse';
const stepTransitionClassnames = [
    stepInClassname,
    stepInReverseClassname,
    stepOutClassname,
    stepOutReverseClassname,
];

const wizardPageChangedEv = 'wizardPageChanged';

const ERR_WIZARD_INVALID_POSITION = 'Invalid position';

const getIdentifier = (wizardEl: HTMLElement): Promise<string> =>
    fastdom.read(() => wizardEl.id || containerClassname);

const getStateObject = (
    wizardEl: HTMLElement,
    position: number
): Promise<{ dispatcher: string, position: number }> =>
    getIdentifier(wizardEl).then(wizardElIdentifier => ({
        dispatcher: wizardElIdentifier,
        position,
    }));

const pushBrowserState = (
    wizardEl: HTMLElement,
    position: number
): Promise<void> =>
    getStateObject(wizardEl, position).then(stateObject =>
        window.history.pushState(stateObject, '')
    );

const updateBrowserState = (
    wizardEl: HTMLElement,
    position: number
): Promise<void> =>
    getStateObject(wizardEl, position).then(stateObject =>
        window.history.replaceState(stateObject, '')
    );

const getDirection = (currentPosition: number, newPosition: number): string => {
    if (currentPosition < 0) {
        return 'none';
    } else if (currentPosition > newPosition) {
        return 'backwards';
    }
    return 'forwards';
};

// #? polyfill.io might struggle with multiple classnames on classList
const animateIncomingStep = (
    wizardEl: HTMLElement,
    stepEl: HTMLElement,
    direction: string
): Promise<void> =>
    fastdom
        .write(() => {
            stepEl.classList.remove(
                stepHiddenClassname,
                ...stepTransitionClassnames
            );
            if (direction !== 'none') {
                stepEl.classList.add(
                    direction === 'forwards'
                        ? stepInClassname
                        : stepInReverseClassname
                );
            }
            setTimeout(() => {
                stepEl.classList.remove(...stepTransitionClassnames);
            }, 300);
        })
        .then(() => fastdom.read(() => stepEl.getBoundingClientRect().height))
        .then(stepHeight =>
            fastdom.write(() => {
                wizardEl.style.minHeight = `${stepHeight}px`;
            })
        );

const animateOutgoingStep = (
    wizardEl: HTMLElement,
    stepEl: HTMLElement,
    direction: string
): Promise<void> =>
    fastdom.write(() => {
        stepEl.classList.remove(...stepTransitionClassnames);
        stepEl.classList.add(
            ...[
                stepHiddenClassname,
                direction === 'forwards'
                    ? stepOutClassname
                    : stepOutReverseClassname,
            ]
        );
        setTimeout(() => {
            stepEl.classList.remove(...stepTransitionClassnames);
        }, 300);
    });

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

const updateSteps = (
    wizardEl: HTMLElement,
    currentPosition: number,
    newPosition: number,
    stepEls: Array<HTMLElement>
): Promise<void> =>
    fastdom.write(() => {
        stepEls.forEach((stepEl: HTMLElement, i: number) => {
            switch (i) {
                case newPosition:
                    stepEl.setAttribute('aria-hidden', 'false');
                    animateIncomingStep(
                        wizardEl,
                        stepEl,
                        getDirection(currentPosition, newPosition)
                    );
                    break;
                case currentPosition:
                    stepEl.setAttribute('aria-hidden', 'true');
                    animateOutgoingStep(
                        wizardEl,
                        stepEl,
                        getDirection(currentPosition, newPosition)
                    );
                    break;
                default:
                    stepEl.setAttribute('aria-hidden', 'true');
                    stepEl.classList.add(stepHiddenClassname);
                    stepEl.classList.remove(...stepTransitionClassnames);
            }
        });
    });

export const setPosition = (
    wizardEl: HTMLElement,
    newPosition: number,
    userInitiated: boolean = true
): Promise<Array<*>> =>
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
                    stepEls: Array<HTMLElement>,
                ]
            ) => {
                if (newPosition < 0 || !stepEls[newPosition]) {
                    throw new Error(ERR_WIZARD_INVALID_POSITION);
                }
                if (currentPosition > -1 && window.scrollY > offsetTop) {
                    scrollTo(offsetTop, 250, 'linear');
                }
                wizardEl.dataset.length = stepEls.length.toString();
                wizardEl.dataset.position = newPosition.toString();
                return Promise.all([
                    userInitiated
                        ? pushBrowserState(wizardEl, newPosition)
                        : updateBrowserState(wizardEl, newPosition),
                    updateCounter(wizardEl),
                    updateSteps(
                        wizardEl,
                        currentPosition,
                        newPosition,
                        stepEls
                    ),
                    wizardEl.dispatchEvent(
                        new CustomEvent(wizardPageChangedEv, {
                            bubbles: true,
                            detail: {
                                currentPosition,
                                newPosition,
                            },
                        })
                    ),
                ]);
            }
        )
        .catch((error: Error) => {
            if (error.message === ERR_WIZARD_INVALID_POSITION) {
                return setPosition(wizardEl, 0);
            }
            throw error;
        });

export const enhance = (wizardEl: HTMLElement): Promise<void> =>
    Promise.all([
        getIdentifier(wizardEl),
        setPosition(wizardEl, 0, false),
    ]).then(([wizardElIdentifier]) => {
        window.addEventListener('popstate', ev => {
            if (
                ev.state &&
                ev.state.dispatcher &&
                ev.state.dispatcher === wizardElIdentifier
            ) {
                ev.preventDefault();
                setPosition(wizardEl, parseInt(ev.state.position, 10), false);
            }
        });

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
        });
    });

export { containerClassname, wizardPageChangedEv };
