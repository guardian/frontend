// @flow

import fastdom from 'lib/fastdom-promise';

import loadEnhancers from './modules/loadEnhancers';
import { newsletterCheckboxClassName } from './consents';
import {
    wizardPageChangedEv,
    setPosition,
    getInfoObject as getWizardInfoObject,
} from './wizard';

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
                .then(([counterEl: HTMLElement, buttonBackEl: HTMLElement]) => {
                    fastdom.write(() => {
                        counterEl.classList.toggle(
                            'manage-account-consent-wizard__revealable--visible',
                            ev.detail.positionName === positions.email
                        );
                        buttonBackEl.classList.toggle(
                            'manage-account-consent-wizard__revealable--visible',
                            ev.detail.position > 0
                        );
                    });
                });
        }
    });
};

const bindNextButton = (buttonEl: HTMLElement): void => {
    const wizardEl = [
        ...document.getElementsByClassName('manage-account-wizard--consent'),
    ][0];
    buttonEl.addEventListener('click', (ev: Event) => {
        ev.preventDefault();
        getWizardInfoObject(wizardEl).then(wizardInfo =>
            setPosition(wizardEl, wizardInfo.position + 1)
        );
    });
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
    ];
    loadEnhancers(loaders);
};

export { enhanceConsentWizard };
