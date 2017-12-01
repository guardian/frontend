// @flow

import fastdom from 'lib/fastdom-promise';

import loadEnhancers from './modules/loadEnhancers';
import { newsletterCheckboxClassName } from './consents';
import { wizardPageChangedEv } from './wizard';

const getClickedCheckboxCount = (
    checkboxesEl: Array<HTMLLabelElement>
): number =>
    checkboxesEl.filter(
        (checkboxEl: HTMLLabelElement) =>
            checkboxEl.control instanceof HTMLInputElement &&
            checkboxEl.control.checked
    ).length;

const getEmailCheckboxes = (): Array<HTMLLabelElement> => [
    ...document.getElementsByClassName(newsletterCheckboxClassName),
];

const updateCounterIndicator = (
    indicatorEl: HTMLElement,
    checkboxesEl: Array<HTMLLabelElement>
): Promise<void> =>
    fastdom.write(() => {
        indicatorEl.innerText = getClickedCheckboxCount(checkboxesEl);
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
                            ev.detail.newPosition === 1
                        );
                        buttonBackEl.classList.toggle(
                            'manage-account-consent-wizard__revealable--visible',
                            ev.detail.newPosition > 0
                        );
                    });
                });
        }
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
    ];
    loadEnhancers(loaders);
};

export { enhanceConsentWizard };
