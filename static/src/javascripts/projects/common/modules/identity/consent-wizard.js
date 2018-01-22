// @flow

import fastdom from 'lib/fastdom-promise';

import loadEnhancers from './modules/loadEnhancers';
import {
    wizardPageChangedEv,
    setPosition,
    getInfoObject as getWizardInfoObject,
} from './wizard';

const ERR_IDENTITY_CONSENT_WIZARD_MISSING = 'Missing wizard element';

const toggleBackButtonEl = (
    buttonBackEl: HTMLElement,
    displayButtonBack: boolean
) =>
    fastdom.write(() => {
        buttonBackEl.setAttribute(
            'aria-hidden',
            (!displayButtonBack).toString()
        );
        if (displayButtonBack) {
            buttonBackEl.removeAttribute('disabled');
        } else {
            buttonBackEl.setAttribute('disabled', 'disabled');
        }
        buttonBackEl.classList.toggle(
            'identity-consent-wizard__revealable--visible',
            displayButtonBack
        );
    });

const toggleLegalDisclaimerEl = (
    legalDisclaimerEl: HTMLElement,
    showOrHide: boolean
) =>
    fastdom.write(() => {
        legalDisclaimerEl.classList.toggle('u-h', !showOrHide);
    });

const bindWizardBlocks = (wizardEl: HTMLElement): void => {
    window.addEventListener(wizardPageChangedEv, ev => {
        if (ev.target === wizardEl) {
            fastdom
                .read(() => [
                    [
                        ...document.getElementsByClassName(
                            'identity-consent-wizard-button-back'
                        ),
                    ][0],
                    [
                        ...document.getElementsByClassName(
                            'identity-consent-wizard-legalsese'
                        ),
                    ][0],
                ])
                .then(
                    (
                        [
                            BackButtonEl: HTMLElement,
                            legalDisclaimerEl: HTMLElement,
                        ]
                    ) =>
                        Promise.all([
                            toggleBackButtonEl(
                                BackButtonEl,
                                ev.detail.position > 0
                            ),
                            toggleLegalDisclaimerEl(
                                legalDisclaimerEl,
                                ev.detail.position === 0
                            ),
                        ])
                );
        }
    });
};

const showWizard = (wizardEl: HTMLElement): Promise<void> =>
    fastdom.write(() => wizardEl.classList.remove('u-h'));

const hideLoading = (loadingEl: HTMLElement): Promise<void> =>
    fastdom.write(() => loadingEl.remove());

const bindNextButton = (buttonEl: HTMLElement): void => {
    const wizardEl: ?Element = buttonEl.closest('.identity-wizard--consent');
    if (wizardEl && wizardEl instanceof HTMLElement) {
        window.addEventListener(wizardPageChangedEv, ev => {
            if (ev.target === wizardEl) {
                buttonEl.dataset.linkName = buttonEl.dataset.linkNameTemplate.replace(
                    '[depth]',
                    `${ev.detail.positionName} : step #${ev.detail.position}`
                );
            }
        });

        buttonEl.addEventListener('click', (ev: Event) => {
            ev.preventDefault();
            getWizardInfoObject(wizardEl).then(wizardInfo =>
                setPosition(wizardEl, wizardInfo.position + 1)
            );
        });
    } else {
        throw new Error(ERR_IDENTITY_CONSENT_WIZARD_MISSING);
    }
};

const enhanceConsentWizard = (): void => {
    const loaders = [
        ['.identity-wizard--consent', bindWizardBlocks],
        ['.identity-wizard--consent', showWizard],
        ['#identityWizardloadingError', hideLoading],
        ['.js-identity-consent-wizard__next', bindNextButton],
    ];
    loadEnhancers(loaders);
};

export { enhanceConsentWizard };
