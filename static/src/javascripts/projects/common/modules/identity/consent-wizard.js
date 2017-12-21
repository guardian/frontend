// @flow

import fastdom from 'lib/fastdom-promise';

import loadEnhancers from './modules/loadEnhancers';
import mediator from 'lib/mediator';
import debounce from 'lodash/functions/debounce';
import { scrollTo } from 'lib/scroller';
import { newsletterCheckboxClassName } from './consents';
import {
    wizardPageChangedEv,
    setPosition,
    getInfoObject as getWizardInfoObject,
} from './wizard';

const ERR_IDENTITY_CONSENT_WIZARD_MISSING = 'Missing wizard element';

const positions = {
    consent: 'consent',
    email: 'email',
    endcard: 'endcard',
};

const getAcceptedCheckboxes = (
    checkboxesEl: Array<HTMLLabelElement>
): Array<HTMLLabelElement> =>
    checkboxesEl.filter(
        (checkboxEl: HTMLLabelElement) =>
            checkboxEl.control instanceof HTMLInputElement &&
            checkboxEl.control.checked
    );

const getAcceptedCheckboxCount = (
    checkboxesEl: Array<HTMLLabelElement>
): number => getAcceptedCheckboxes(checkboxesEl).length;

const getEmailCheckboxes = (): Array<HTMLLabelElement> =>
    ([...document.getElementsByClassName(newsletterCheckboxClassName)]: Array<
        any
    >).filter(el => el instanceof HTMLLabelElement);

const updateCounterIndicator = (
    indicatorEl: HTMLElement,
    checkboxesEl: Array<HTMLLabelElement>
): Promise<void> =>
    fastdom.write(() => {
        indicatorEl.innerText = getAcceptedCheckboxCount(checkboxesEl).toString(
            10
        );
    });

const bindEmailConsentCounterToWizard = (wizardEl: HTMLElement): void => {
    window.addEventListener(wizardPageChangedEv, ev => {
        if (ev.target === wizardEl) {
            fastdom
                .read(() => [
                    wizardEl.getElementsByClassName(
                        'manage-account-wizard__step'
                    ).length,
                    [
                        ...document.getElementsByClassName(
                            'manage-account-consent-wizard-counter'
                        ),
                    ][0],
                    [
                        ...document.getElementsByClassName(
                            'manage-account-consent-wizard-button-back'
                        ),
                    ][0],
                ])
                .then(
                    (
                        [
                            stepCount: number,
                            counterEl: HTMLElement,
                            buttonBackEl: HTMLElement,
                        ]
                    ) =>
                        fastdom.write(() => {
                            if (stepCount <= 2) {
                                buttonBackEl.remove();
                            } else if (buttonBackEl) {
                                const displayButtonBack =
                                    ev.detail.position > 0;
                                buttonBackEl.setAttribute(
                                    'aria-hidden',
                                    (!displayButtonBack).toString()
                                );
                                if (displayButtonBack) {
                                    buttonBackEl.removeAttribute('disabled');
                                } else {
                                    buttonBackEl.setAttribute(
                                        'disabled',
                                        'disabled'
                                    );
                                }
                                buttonBackEl.classList.toggle(
                                    'manage-account-consent-wizard__revealable--visible',
                                    displayButtonBack
                                );
                            }
                            const displayCounter =
                                ev.detail.positionName === positions.email;
                            counterEl.setAttribute(
                                'aria-hidden',
                                (!displayCounter).toString()
                            );
                            counterEl.classList.toggle(
                                'manage-account-consent-wizard__revealable--visible',
                                displayCounter
                            );
                        })
                );
        }
    });
};

const bindScrollForNextButton = (buttonEl: HTMLElement): void => {
    const check = () =>
        shouldNextButtonScroll().then(shouldIt =>
            fastdom.write(() => {
                buttonEl.classList.toggle(
                    'manage-account__button--icon--rotate-down',
                    shouldIt
                );
            })
        );

    mediator.on('window:throttledScroll', debounce(check, 100));

    check();
};

const shouldNextButtonScroll = (): Promise<boolean> =>
    fastdom.read(
        () =>
            window.scrollY + window.innerHeight + 100 <
            document.body.offsetHeight
    );

const bindNextButton = (buttonEl: HTMLElement): void => {
    const wizardEl: ?Element = buttonEl.closest(
        '.manage-account-wizard--consent'
    );
    if (wizardEl && wizardEl instanceof HTMLElement) {
        buttonEl.addEventListener('click', (ev: Event) => {
            ev.preventDefault();
            shouldNextButtonScroll().then(shouldIt => {
                if (shouldIt) {
                    scrollTo(
                        window.scrollY + window.innerHeight * 0.75,
                        250,
                        'linear'
                    );
                } else {
                    getWizardInfoObject(wizardEl).then(wizardInfo =>
                        setPosition(wizardEl, wizardInfo.position + 1)
                    );
                }
            });
        });
    } else {
        throw new Error(ERR_IDENTITY_CONSENT_WIZARD_MISSING);
    }
};

const createEmailConsentCounter = (counterEl: HTMLElement): void => {
    const indicatorEl = document.createElement('div');
    const textEl = document.createElement('div');
    const checkboxesEl = getEmailCheckboxes();

    indicatorEl.classList.add(
        'manage-account-consent-wizard-counter__indicator'
    );
    textEl.classList.add('manage-account-consent-wizard-counter__text');

    updateCounterIndicator(indicatorEl, checkboxesEl);

    checkboxesEl.forEach(checkboxEl => {
        checkboxEl.addEventListener('change', () => {
            updateCounterIndicator(indicatorEl, checkboxesEl);
        });
    });
    fastdom.write(() => {
        textEl.innerHTML = `of <strong>${
            checkboxesEl.length
        }</strong> selected`;
        counterEl.append(indicatorEl);
        counterEl.append(textEl);
    });
};

const enhanceConsentWizard = (): void => {
    const loaders = [
        ['.manage-account-consent-wizard-counter', createEmailConsentCounter],
        ['.manage-account-wizard--consent', bindEmailConsentCounterToWizard],
        ['.js-manage-account-consent-wizard__next', bindNextButton],
        ['.js-manage-account-consent-wizard__next', bindScrollForNextButton],
    ];
    loadEnhancers(loaders);
};

export { enhanceConsentWizard };
