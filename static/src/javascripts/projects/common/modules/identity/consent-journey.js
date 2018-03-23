// @flow

import fastdom from 'lib/fastdom-promise';
import { addCookie } from 'lib/cookies';

import loadEnhancers from './modules/loadEnhancers';
import { show as showModal } from './modules/modal';

const ERR_MALFORMED_HTML = 'Something went wrong';
const HAS_VISITED_CONSENTS_COOKIE_KEY =
    'gu_consents_user_has_visited_consents_once';

const showJourney = (journeyEl: HTMLElement): Promise<void> =>
    fastdom.write(() => journeyEl.classList.remove('u-h'));

const hideLoading = (loadingEl: HTMLElement): Promise<void> =>
    fastdom.write(() => loadingEl.remove());

const uncheckedBoxes = (
    journeyEl: HTMLElement,
    section: string
): Promise<Object> =>
    fastdom
        .read(() => [
            ...journeyEl.querySelectorAll(
                `.identity-consent-journey-step--${
                    section
                } input[type=checkbox]`
            ),
        ])
        .then(checkboxes => ({
            unchecked: checkboxes.filter(_ => _.checked === false),
            total: checkboxes,
        }));

const missingNewsletters = (journeyEl: HTMLElement): Promise<Object> =>
    uncheckedBoxes(journeyEl, 'email');

const missingConsents = (journeyEl: HTMLElement): Promise<Object> =>
    uncheckedBoxes(journeyEl, 'marketing-consents');

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
                    missingNewsletters(journeyEl),
                    missingConsents(journeyEl),
                ]).then(([newslettersCheckboxInfo, marketingCheckboxInfo]) => {
                    if (
                        newslettersCheckboxInfo.unchecked.length > 0 ||
                        marketingCheckboxInfo.unchecked.length > 0
                    ) {
                        const allUncheckedBoxes = newslettersCheckboxInfo.unchecked.concat(
                            marketingCheckboxInfo.unchecked
                        );
                        const names = allUncheckedBoxes.map(
                            box =>
                                box.parentElement.querySelector(
                                    '.manage-account__switch-title'
                                ).innerText
                        );
                        showModal('confirm-consents', names);
                    } else {
                        formEl.submit();
                    }
                });
            }
        });
    });
};

const submitJourneyAnyway = (buttonEl: HTMLElement): void => {
    const journeyEl = ((buttonEl.closest(
        '.identity-consent-journey'
    ): any): HTMLElement);
    if (!journeyEl) throw new Error(ERR_MALFORMED_HTML);
    buttonEl.addEventListener('click', () => {
        getForm(journeyEl).then(formEl => {
            formEl.submit();
        });
    });
};

const setLocalHasVisitedConsentsFlag = (): void => {
    /* opt-in-engagement-banner will use this to decide whether to show an alert or not */
    addCookie(HAS_VISITED_CONSENTS_COOKIE_KEY, 'true', null, true);
};

const enhanceConsentJourney = (): void => {
    const loaders = [
        ['.identity-consent-journey', showJourney],
        ['.identity-consent-journey', showJourneyAlert],
        ['.identity-consent-journey', setLocalHasVisitedConsentsFlag],
        ['.js-identity-consent-journey-continue', submitJourneyAnyway],
        ['#identityConsentsLoadingError', hideLoading],
    ];
    loadEnhancers(loaders);
};

export { enhanceConsentJourney, HAS_VISITED_CONSENTS_COOKIE_KEY };
