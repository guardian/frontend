// @flow

import config from 'lib/config';
import errorTriangle from 'svgs/icon/error-triangle.svg';
import { submitClickEvent } from 'common/modules/commercial/acquisitions-ophan';

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
    const reminderPrompt = document.querySelector('.epic-reminder__prompt');

    if (
        helpText &&
        submitButton &&
        submitButton instanceof HTMLButtonElement &&
        emailInput &&
        emailInput instanceof HTMLInputElement &&
        titleField &&
        thankYouText &&
        formWrapper &&
        closeButton &&
        reminderPrompt
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
        };
    }
};

const epicReminderEmailSignup = (fields: Fields) => {
    const warningRed = '#c70000';

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
                    'Thank you! Your support is so valuable.';
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
        sendReminderEvent().then(response => {
            if (response.ok) {
                setState('success');
            } else {
                setState('failure');
            }
        });
    });

    fields.reminderPrompt.addEventListener('click', () => {
        submitClickEvent({
            component: {
                componentType: 'ACQUISITIONS_OTHER',
                id: 'precontribution-reminder-prompt-clicked',
            },
        });
    });
};

export { getFields, epicReminderEmailSignup };
