// @flow
import bean from 'bean';
import fastdom from 'fastdom';
import $ from 'lib/$';
import fetch from 'lib/fetch';
import config from 'lib/config';
import { getUserFromCookie, getUserFromApi } from 'common/modules/identity/api';

const classes = {
    wrapper: 'js-newsletter-meta',
    signupForm: 'js-email-sub__form',
    textInput: 'js-newsletter-card__text-input',
    signupButton: 'js-newsletter-signup-button',
    styleSignup: 'newsletter-card__lozenge--submit',
    signupConfirm: 'js-signup-confirmation',
    previewButton: 'js-newsletter-preview',
};

const hideInputAndShowPreview = (el: ?Node): void => {
    fastdom.write(() => {
        $(`.${classes.textInput}`, el).addClass('is-hidden');
        $(`.${classes.signupButton}`, el).removeClass(classes.styleSignup);
        $(`.${classes.previewButton}`, el).removeClass('is-hidden');
    });
};

const validate = (form: ?HTMLFormElement): boolean => {
    // simplistic email address validation
    const emailAddress = $(`.${classes.textInput}`, form).val();
    return typeof emailAddress === 'string' && emailAddress.indexOf('@') > -1;
};

const addSubscriptionMessage = (buttonEl: HTMLButtonElement): void => {
    const meta = $.ancestor(buttonEl, classes.wrapper);
    fastdom.write(() => {
        $(buttonEl.form).addClass('is-hidden');
        $(`.${classes.previewButton}`, meta).addClass('is-hidden');
        $(`.${classes.signupConfirm}`, meta).removeClass('is-hidden');
    });
};

const submitForm = (
    form: ?HTMLFormElement,
    buttonEl: HTMLButtonElement
): Promise<void> => {
    const email = $('input[name="email"]', form).val();
    const listId = $('input[name="listId"]', form).val();
    const formQueryString = `email=${email}&listId=${listId}`;

    return fetch(`${config.page.ajaxUrl}/email`, {
        method: 'post',
        body: formQueryString,
        headers: {
            Accept: 'application/json',
        },
    }).then(response => {
        if (response.ok) {
            addSubscriptionMessage(buttonEl);
        }
    });
};

const subscribeToEmail = (buttonEl: HTMLButtonElement): void => {
    bean.on(buttonEl, 'click', () => {
        const form = buttonEl.form;
        if (validate(form)) {
            submitForm(form, buttonEl);
        }
    });
};

const showSignupForm = (buttonEl: HTMLButtonElement): void => {
    const form = buttonEl.form;
    const meta = $.ancestor(buttonEl, 'js-newsletter-meta');
    fastdom.write(() => {
        $(`.${classes.textInput}`, form)
            .removeClass('is-hidden')
            .focus();
        $(`.${classes.signupButton}`, form).addClass(classes.styleSignup);
        $(`.${classes.previewButton}`, meta).addClass('is-hidden');
        subscribeToEmail(buttonEl);
    });
};

const updatePageForLoggedIn = (emailAddress: string, el: ?Node): void => {
    fastdom.write(() => {
        hideInputAndShowPreview(el);
        $(`.${classes.textInput}`, el).val(emailAddress);
    });
};

const showSecondStageSignup = (buttonEl: HTMLButtonElement): void => {
    fastdom.write(() => {
        buttonEl.setAttribute('type', 'button');
        bean.on(buttonEl, 'click', () => {
            showSignupForm(buttonEl);
        });
    });
};

const enhanceNewsletters = (): void => {
    if (getUserFromCookie() !== null) {
        // email address is not stored in the cookie, gotta go to the Api
        getUserFromApi(userFromId => {
            if (userFromId && userFromId.primaryEmailAddress) {
                updatePageForLoggedIn(userFromId.primaryEmailAddress);
                $.forEachElement(`.${classes.signupButton}`, subscribeToEmail);
            }
        });
    } else {
        hideInputAndShowPreview();
        $.forEachElement(`.${classes.signupButton}`, showSecondStageSignup);
    }
};

const init = (): void => {
    enhanceNewsletters();
};

export { init };
