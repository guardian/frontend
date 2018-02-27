// @flow

import fastdom from 'lib/fastdom-promise';

import loadEnhancers from './modules/loadEnhancers';
import { show as showModal } from './modules/modal';

const ERR_MALFORMED_HTML = 'Something went wrong';

const showJourney = (journeyEl: HTMLElement): Promise<void> =>
    fastdom.write(() => journeyEl.classList.remove('u-h'));

const hideLoading = (loadingEl: HTMLElement): Promise<void> =>
    fastdom.write(() => loadingEl.remove());

const shouldDisplaySectionWarning = (
    journeyEl: HTMLElement,
    section: string
): Promise<boolean> =>
    fastdom
        .read(() => [
            ...journeyEl.querySelectorAll(
                `.identity-consent-journey-step--${
                    section
                } input[type=checkbox]`
            ),
        ])
        .then(checkboxes => ({
            checked: checkboxes.filter(_ => _.checked === true).length,
            total: checkboxes.length,
        }))
        .then(
            checkboxInfo =>
                !(checkboxInfo.total > 0 && checkboxInfo.checked > 0)
        );

const shouldDisplayNewsletterWarning = (
    journeyEl: HTMLElement
): Promise<boolean> => shouldDisplaySectionWarning(journeyEl, 'email');

const shouldDisplayConsentWarning = (
    journeyEl: HTMLElement
): Promise<boolean> =>
    shouldDisplaySectionWarning(journeyEl, 'marketing-consents');

const getForm = (journeyEl: HTMLElement) =>
    fastdom.read(
        () =>
            journeyEl.querySelector('form.js-identity-consent-journey-form') ||
            new Error(ERR_MALFORMED_HTML)
    );

const showJourneyAlert = (journeyEl: HTMLElement): void => {
    getForm(journeyEl).then(formEl => {
        formEl.addEventListener('submit', ev => {
            if (ev.isTrusted) {
                ev.preventDefault();
                Promise.all([
                    shouldDisplayNewsletterWarning(journeyEl),
                    shouldDisplayConsentWarning(journeyEl),
                ]).then(([emptyNewsletters, emptyMarketing]) => {
                    if (emptyNewsletters && emptyMarketing) {
                        showModal('confirm-consents');
                    } else {
                        formEl.submit();
                    }
                });
            }
        });
    });
};

const submitJourneyAnyway = (buttonEl: HTMLElement): void => {
    const journeyEl =
        buttonEl.closest('.identity-consent-journey') ||
        new Error(ERR_MALFORMED_HTML);
    buttonEl.addEventListener('click', () => {
        getForm(journeyEl).then(formEl => {
            formEl.submit();
        });
    });
};

const enhanceConsentJourney = (): void => {
    const loaders = [
        ['.identity-consent-journey', showJourney],
        ['.identity-consent-journey', showJourneyAlert],
        ['.js-identity-consent-journey-continue', submitJourneyAnyway],
        ['#identityConsentsLoadingError', hideLoading],
    ];
    loadEnhancers(loaders);
};

export { enhanceConsentJourney };
