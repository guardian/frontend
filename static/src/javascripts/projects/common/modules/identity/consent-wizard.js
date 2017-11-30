// @flow

import fastdom from 'lib/fastdom-promise';

import loadEnhancers from './modules/loadEnhancers';
import { newsletterCheckboxClassName } from './consents';

const getClickedCheckboxes = (
    checkboxesEl: Array<HTMLLabelElement>
): Promise<void> =>
    fastdom.read(
        () =>
            checkboxesEl.filter(
                (checkboxEl: HTMLLabelElement) =>
                    checkboxEl.control instanceof HTMLInputElement &&
                    checkboxEl.control.checked
            ).length
    );

const getEmailCheckboxes = (): Promise<Array<HTMLLabelElement>> =>
    fastdom.read(() => [
        ...document.getElementsByClassName(newsletterCheckboxClassName),
    ]);

const updateCounterIndicator = (
    indicatorEl: HTMLElement,
    checkboxesEl: Array<HTMLLabelElement>
): Promise<void> =>
    getClickedCheckboxes(checkboxesEl).then(count =>
        fastdom.write(() => {
            indicatorEl.innerText = count;
        })
    );

const createEmailConsentCounter = (counterEl: HTMLFormElement): void => {
    const indicatorEl = document.createElement('div');
    const textEl = document.createElement('div');

    indicatorEl.classList.add(
        'manage-account-consent-wizard-counter__indicator'
    );
    textEl.classList.add('manage-account-consent-wizard-counter__text');

    getEmailCheckboxes().then(checkboxesEl => {
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
        });
    });

    fastdom.write(() => {
        counterEl.append(indicatorEl);
        counterEl.append(textEl);
    });
};

const enhanceConsentWizard = (): void => {
    const loaders = [
        ['.manage-account-consent-wizard-counter', createEmailConsentCounter],
    ];
    loadEnhancers(loaders);
};

export { enhanceConsentWizard };
