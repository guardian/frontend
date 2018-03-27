// @flow

import fastdom from 'lib/fastdom-promise';
import { addCookie } from 'lib/cookies';

import loadEnhancers from './modules/loadEnhancers';
import { getContents, show as showModal } from './modules/modal';

const ERR_MALFORMED_HTML = 'Something went wrong';
const HAS_VISITED_CONSENTS_COOKIE_KEY =
    'gu_consents_user_has_visited_consents_once';
const ERR_MODAL_MALFORMED = 'Modal is malformed';

const removeNewsletterReminders = (reminderEl: HTMLElement) =>
    fastdom.write(() => {
        if (reminderEl) {
            while (reminderEl.firstChild) {
                reminderEl.removeChild(reminderEl.firstChild);
            }
        }
    });

const insertNewsletterReminders = (
    modalEl: HTMLElement,
    uncheckedNewsletters: Array<string>
): Promise<void> =>
    fastdom
        .read(() => {
            const el = modalEl.querySelector(
                `.identity-consent-journey-modal__reminder`
            );
            if (el) return el;
            throw new Error(ERR_MODAL_MALFORMED);
        })
        .then(reminderEl => {
            fastdom.write(() => {
                removeNewsletterReminders(reminderEl).then(() =>
                    uncheckedNewsletters.map(newsletterName => {
                        const li = document.createElement('li');
                        li.innerHTML = `<b>${newsletterName}</b>`;
                        reminderEl.appendChild(li);
                        return modalEl;
                    })
                );
            });
        });

const showRemindersDiv = (modalEl: HTMLElement): Promise<void> =>
    fastdom
        .read(() => {
            const reminderDiv = modalEl.querySelector(
                `.identity-forms-message-reminder__body`
            );
            const noReminderDiv = modalEl.querySelector(
                `.identity-forms-message-no-reminder__body`
            );
            return {
                reminderDiv,
                noReminderDiv,
            };
        })
        .then(modalAreas =>
            fastdom.write(() => {
                modalAreas.reminderDiv.classList.remove(
                    'identity-forms-message-reminder__body--inactive'
                );
                modalAreas.noReminderDiv.classList.add(
                    'identity-forms-message-reminder__body--inactive'
                );
            })
        );

const showNoRemindersDiv = (modalEl: HTMLElement): Promise<void> =>
    fastdom
        .read(() => {
            const reminderDiv = modalEl.querySelector(
                `.identity-forms-message-reminder__body`
            );
            const noReminderDiv = modalEl.querySelector(
                `.identity-forms-message-no-reminder__body`
            );
            return {
                reminderDiv,
                noReminderDiv,
            };
        })
        .then(modalAreas =>
            fastdom.write(() => {
                modalAreas.reminderDiv.classList.add(
                    'identity-forms-message-reminder__body--inactive'
                );
                modalAreas.noReminderDiv.classList.remove(
                    'identity-forms-message-reminder__body--inactive'
                );
            })
        );

const showJourney = (journeyEl: HTMLElement): Promise<void> =>
    fastdom.write(() => journeyEl.classList.remove('u-h'));

const hideLoading = (loadingEl: HTMLElement): Promise<void> =>
    fastdom.write(() => loadingEl.remove());

const getCheckboxInfo = (
    journeyEl: HTMLElement,
    section: string
): Promise<Array<Object>> =>
    fastdom.read(() => [
        ...journeyEl.querySelectorAll(
            `.identity-consent-journey-step--${section} input[type=checkbox]`
        ),
    ]);

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
                    getCheckboxInfo(journeyEl, 'email'),
                    getCheckboxInfo(journeyEl, 'marketing-consents'),
                ])
                    .then(checkboxes => {
                        const allCheckboxes = [].concat(...checkboxes);
                        const unchecked = allCheckboxes.filter(
                            _ => _.checked === false
                        );

                        return {
                            unchecked,
                            total: allCheckboxes.length,
                        };
                    })
                    .then(checkboxInfo => {
                        if (
                            checkboxInfo.unchecked.length === checkboxInfo.total
                        ) {
                            showNoRemindersDiv(journeyEl).then(() =>
                                showModal('confirm-consents')
                            );
                        } else if (checkboxInfo.unchecked.length > 0) {
                            showRemindersDiv(journeyEl).then(() => {
                                const consentNames = checkboxInfo.unchecked.map(
                                    uncheckedbox =>
                                        uncheckedbox.parentElement.querySelector(
                                            '.manage-account__switch-title'
                                        ).innerText
                                );
                                getContents('confirm-consents').then(
                                    modalEl => {
                                        if (consentNames.length > 0) {
                                            insertNewsletterReminders(
                                                modalEl,
                                                consentNames
                                            );
                                        }
                                    }
                                );
                                showModal('confirm-consents');
                            });
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
