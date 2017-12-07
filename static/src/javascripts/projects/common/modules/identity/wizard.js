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

declare class PopStateEvent extends Event {
    state: Object;
}

const getPositionFromName = (
    wizardEl: HTMLElement,
    position: string
): number => {
    const pageEl = wizardEl.querySelector(
        `[data-wizard-step-name=${position}]`
    );
    if (pageEl && pageEl.parentElement && pageEl.parentElement.children) {
        return [...pageEl.parentElement.children].indexOf(pageEl);
    }

    throw new Error(ERR_WIZARD_INVALID_POSITION);
};

const getPositionName = (wizardEl: HTMLElement, step: number): string => {
    const stepEl = [...wizardEl.getElementsByClassName(stepClassname)][step];

    if (stepEl && stepEl.dataset && stepEl.dataset.wizardStepName) {
        return stepEl.dataset.wizardStepName;
    }

    return `step-${step}`;
};

const getIdentifier = (wizardEl: HTMLElement): Promise<string> =>
    fastdom.read(() => wizardEl.id || containerClassname);

const getPosition = (wizardEl: HTMLElement): Promise<number> =>
    Promise.resolve(parseInt(wizardEl.dataset.position, 10));

const getInfoObject = (
    wizardEl: HTMLElement,
    optionalPosition: ?number
): Promise<{| dispatcher: string, position: number, positionName: string |}> =>
    Promise.all([
        getIdentifier(wizardEl),
        optionalPosition || getPosition(wizardEl),
    ]).then(([wizardElIdentifier, position]) => ({
        dispatcher: wizardElIdentifier,
        position,
        positionName: getPositionName(wizardEl, position),
    }));

const pushBrowserState = (
    wizardEl: HTMLElement,
    position: number
): Promise<void> =>
    getInfoObject(wizardEl, position).then(stateObject =>
        window.history.pushState(stateObject, '')
    );

const updateBrowserState = (
    wizardEl: HTMLElement,
    position: number
): Promise<void> =>
    getInfoObject(wizardEl, position).then(stateObject =>
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

const setPosition = (
    wizardEl: HTMLElement,
    unresolvedNewPosition: number | string,
    userInitiated: boolean = true
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
                    stepEls: Array<HTMLElement>,
                ]
            ) => {
                const newPosition: number =
                    typeof unresolvedNewPosition === 'string'
                        ? getPositionFromName(wizardEl, unresolvedNewPosition)
                        : unresolvedNewPosition;
                if (newPosition < 0 || !stepEls[newPosition]) {
                    throw new Error(ERR_WIZARD_INVALID_POSITION);
                }
                if (currentPosition > -1 && window.scrollY > offsetTop) {
                    scrollTo(offsetTop, 250, 'linear');
                }
                wizardEl.dataset.length = stepEls.length.toString();
                wizardEl.dataset.position = newPosition.toString();
                wizardEl.dataset.positionName = getPositionName(
                    wizardEl,
                    newPosition
                );

                return [currentPosition, newPosition, stepEls];
            }
        )
        .then(([currentPosition, newPosition, stepEls]) =>
            Promise.all([
                currentPosition,
                newPosition,
                userInitiated
                    ? pushBrowserState(wizardEl, newPosition)
                    : updateBrowserState(wizardEl, newPosition),
                updateCounter(wizardEl),
                updateSteps(wizardEl, currentPosition, newPosition, stepEls),
            ])
        )
        .then(([currentPosition, newPosition]) =>
            Promise.all([
                getInfoObject(wizardEl, currentPosition),
                getInfoObject(wizardEl, newPosition),
            ])
        )
        .then(([currentInfo, newInfo]) => {
            wizardEl.dispatchEvent(
                new CustomEvent(wizardPageChangedEv, {
                    bubbles: true,
                    detail: {
                        ...newInfo,
                        previous: currentInfo,
                    },
                })
            );
        })
        .catch((error: Error) => {
            if (error.message === ERR_WIZARD_INVALID_POSITION) {
                return setPosition(wizardEl, 0);
            }
            throw error;
        });

const enhance = (wizardEl: HTMLElement): Promise<void> =>
    Promise.all([
        getIdentifier(wizardEl),
        setPosition(wizardEl, 0, false),
    ]).then(([wizardElIdentifier]) => {
        window.addEventListener('popstate', (ev: PopStateEvent) => {
            if (
                ev.state.dispatcher &&
                ev.state.dispatcher === wizardElIdentifier
            ) {
                ev.preventDefault();
                setPosition(wizardEl, parseInt(ev.state.position, 10), false);
            }
        });

        /*
        The following code checks for the
        existence of .closest() to catch any HTMLElement
        derived types such as canvases or svgs
        */
        wizardEl.addEventListener('click', (ev: Event) => {
            if (
                ev.target.closest &&
                ev.target.closest instanceof Function &&
                ev.target.closest(`.${nextButtonElClassname}`) !== null
            ) {
                setPosition(
                    wizardEl,
                    parseInt(wizardEl.dataset.position, 10) + 1
                );
            }
            if (
                ev.target.closest &&
                ev.target.closest instanceof Function &&
                ev.target.closest(`.${prevButtonElClassname}`) !== null
            ) {
                setPosition(
                    wizardEl,
                    parseInt(wizardEl.dataset.position, 10) - 1
                );
            }
        });
    });

export {
    containerClassname,
    wizardPageChangedEv,
    enhance,
    setPosition,
    getInfoObject,
};
