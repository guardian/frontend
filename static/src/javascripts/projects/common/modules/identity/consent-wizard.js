// @flow

import loadEnhancers from './modules/loadEnhancers';

const createEmailConsentCounter = (counterEl: HTMLFormElement): void => {
    counterEl.innerHTML = `
        <div class="manage-account-consent-wizard-counter__indicator">
            4
        </div>
        <div class="manage-account-consent-wizard-counter__text">
            of <strong>18</strong> selected
        </div>    
    `;
};

const enhanceConsentWizard = (): void => {
    const loaders = [
        ['.manage-account-consent-wizard-counter', createEmailConsentCounter],
    ];
    loadEnhancers(loaders);
};

export { enhanceConsentWizard };
