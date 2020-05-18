// @flow

import config from 'lib/config';
import errorTriangle from 'svgs/icon/error-triangle.svg';
import {submitClickEvent, submitViewEvent} from 'common/modules/commercial/acquisitions-ophan';
import {addCookie} from "lib/cookies";
import {CONTRIBUTIONS_REMINDER_SIGNED_UP} from "common/modules/commercial/user-features";

type ReminderState = 'invalid' | 'pending' | 'success' | 'failure';

type Fields = {
    submitButton: HTMLButtonElement,
    helpText: HTMLElement,
    emailInput: HTMLInputElement,
    formWrapper: HTMLElement,
    titleField: HTMLElement,
    thankYouText: HTMLElement,
    closeButton: HTMLElement,
    reminderPrompt: HTMLElement,
    reminderToggle: HTMLInputElement,
};

const isValidEmail = (email: string) => {
    const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return re.test(email);
};

const getFields = (): ?Fields => {
    const helpText = document.querySelector('.epic-reminder__email-help-text');
    const submitButton = document.querySelector(
        '.epic-reminder__submit-button'
    );
    const emailInput = document.querySelector('.epic-reminder__email-input');
    const formWrapper = document.querySelector('.epic-reminder__form-wrapper');
    const titleField = document.querySelector('.epic-reminder__form-title');
    const thankYouText = document.querySelector('.epic-reminder__thank-you');
    const closeButton = document.querySelector('.epic-reminder__close-button');
    const reminderPrompt = document.querySelector(
        '.component-button--reminder-prompt'
    );
    const reminderToggle = document.querySelector(
        '.epic-reminder__reveal-reminder'
    );

    if (
        helpText &&
        submitButton &&
        emailInput &&
        titleField &&
        thankYouText &&
        formWrapper &&
        closeButton &&
        reminderPrompt &&
        reminderToggle &&
        submitButton instanceof HTMLButtonElement &&
        emailInput instanceof HTMLInputElement &&
        reminderToggle instanceof HTMLInputElement
    ) {
        // when the js html template string is interpreted,
        // this field gets initialised with a string of whitespace
        // in order for css ':empty' selector to work properly,
        // the whitespace string needs to be deleted
        helpText.innerHTML = '';

        return {
            submitButton,
            helpText,
            emailInput,
            formWrapper,
            titleField,
            thankYouText,
            closeButton,
            reminderPrompt,
            reminderToggle,
        };
    }
};

const epicReminderEmailSignup = (fields: Fields) => {
    const warningRed = '#c70000';

    submitViewEvent({
        component: {
            componentType: 'ACQUISITIONS_OTHER',
            id: `precontribution-reminder-view`,
        },
    });

    const setState = (state: ReminderState) => {
        switch (state) {
            case 'invalid':
                fields.helpText.style.color = warningRed;
                fields.emailInput.style.outline = `4px solid ${warningRed}`;
                fields.helpText.innerHTML = `${
                    errorTriangle.markup
                } Invalid email address`;
                break;
            case 'pending':
                fields.emailInput.disabled = true;
                fields.submitButton.disabled = true;
                fields.emailInput.style.outline = 'initial';
                fields.submitButton.innerHTML = 'Pending';
                fields.helpText.innerHTML = '';
                break;
            case 'success':
                fields.thankYouText.style.display = 'block';
                fields.formWrapper.style.display = 'none';
                fields.closeButton.style.display = 'none';
                fields.titleField.innerHTML =
                    'Thank you! Your reminder is set.';

                addCookie(
                    CONTRIBUTIONS_REMINDER_SIGNED_UP.name,
                    new Date().getTime().toString(),
                    CONTRIBUTIONS_REMINDER_SIGNED_UP.daysToLive
                );

                break;
            case 'failure':
                fields.submitButton.innerHTML = 'Something went wrong';
                fields.helpText.innerHTML =
                    "Sorry we weren't able to sign you up for a reminder, please try again later";
                break;
            default:
                break;
        }
    };

    const sendReminderEvent = (): Promise<Response> => {
        const isProd = config.get('page.isProd');

        const email = fields.emailInput.value || '';

        if (!isValidEmail(email)) {
            setState('invalid');
            return Promise.reject(new Error('Email is invalid'));
        }

        setState('pending');

        const reminderDate = fields.submitButton.getAttribute(
            'data-reminder-date'
        );

        const createReminderEndpoint = isProd
            ? 'https://contribution-reminders.support.guardianapis.com/remind-me'
            : 'https://contribution-reminders-code.support.guardianapis.com/remind-me';

        return fetch(createReminderEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                reminderDate,
                isPreContribution: true,
            }),
        });
    };

    fields.submitButton.addEventListener('click', (event: Event) => {
        event.preventDefault();
        sendReminderEvent()
            .then(response => {
                if (response.ok) {
                    setState('success');
                } else {
                    setState('failure');
                }
            })
            .catch(error => console.error(error));
    });

    // This bit of logic to send an analytics event when a user
    // engages with the precontribution reminder is abstracted so it
    // can be used either in the case that a user clicks or a user
    // hits enter on their keyboard
    const sendPromptClickEvent = () => {
        const ctaAttribute = fields.reminderPrompt.getAttribute(
            'data-cta-copy'
        );
        const ctaForAnalytics = ctaAttribute
            ? ctaAttribute.toLowerCase().replace(/\s/g, '-')
            : '';

        // For second round of testing, the events will be either (tested):
        // precontribution-reminder-prompt-copy-remind-me-in-july or
        // precontribution-reminder-prompt-copy-support-us-later
        submitClickEvent({
            component: {
                componentType: 'ACQUISITIONS_OTHER',
                id: `precontribution-reminder-prompt-copy-${ctaForAnalytics}`,
            },
        });
    };

    // The reminder's visibility is dependent on a hidden checkbox field
    // being checked or unchecked (a simple CSS solution), however the checking
    // and unchecking also needs to happen for users who are just using a
    // keyboard. This is a light JS solution for toggling the checkbox when a user
    // hits enter, as they would for a link
    const toggleReminderVisibility = () => {
        submitClickEvent({
            component: {
                componentType: 'ACQUISITIONS_OTHER',
                id: 'precontribution-reminder-reveal-clicked',
            },
        });
        fields.reminderToggle.checked = !fields.reminderToggle.checked;
    };

    // These are the three event listeners relevant for the above
    // event handlers
    fields.reminderPrompt.addEventListener('click', sendPromptClickEvent);

    fields.reminderPrompt.addEventListener(
        'keypress',
        (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                sendPromptClickEvent();
                toggleReminderVisibility();
            }
        }
    );

    fields.closeButton.addEventListener('keypress', (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            toggleReminderVisibility();
        }
    });
};

export { getFields, epicReminderEmailSignup };
