// @flow
import bean from 'bean';
import fastdom from 'fastdom';
import $ from 'lib/$';
import fetch from 'lib/fetch';
import config from 'lib/config';
import Id from 'common/modules/identity/api';

const classes = {
    wrapper: 'js-newsletter-meta',
    signupForm: 'js-email-sub__form',
    textInput: 'js-newsletter-card__text-input',
    signupButton: 'js-newsletter-signup-button',
    styleSignup: 'newsletter-card__lozenge--submit',
    signupConfirm: 'js-signup-confirmation',
    previewButton: 'js-newsletter-preview',
};

const hideInputAndShowPreview = el => {
    fastdom.write(() => {
        $(`.${classes.textInput}`, el).addClass('is-hidden');
        $(`.${classes.signupButton}`, el).removeClass(classes.styleSignup);
        $(`.${classes.previewButton}`, el).removeClass('is-hidden');
    });
};

const validate = form => {
    // simplistic email address validation
    const emailAddress = $(`.${classes.textInput}`, form).val();
    return typeof emailAddress === 'string' && emailAddress.indexOf('@') > -1;
};

const addSubscriptionMessage = buttonEl => {
    const meta = $.ancestor(buttonEl, classes.wrapper);
    fastdom.write(() => {
        $(buttonEl.form).addClass('is-hidden');
        $(`.${classes.previewButton}`, meta).addClass('is-hidden');
        $(`.${classes.signupConfirm}`, meta).removeClass('is-hidden');
    });
};

const submitForm = (form, buttonEl) => {
    const formQueryString = `email=${form.email.value}&listId=${form.listId.value}`;
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

const subscribeToEmail = buttonEl => {
    bean.on(buttonEl, 'click', () => {
        const form = buttonEl.form;
        if (validate(form)) {
            submitForm(form, buttonEl);
        }
    });
};

const showSignupForm = buttonEl => {
    const form = buttonEl.form;
    const meta = $.ancestor(buttonEl, 'js-newsletter-meta');
    fastdom.write(() => {
        $(`.${classes.textInput}`, form).removeClass('is-hidden').focus();
        $(`.${classes.signupButton}`, form).addClass(classes.styleSignup);
        $(`.${classes.previewButton}`, meta).addClass('is-hidden');
        subscribeToEmail(buttonEl);
    });
};

const updatePageForLoggedIn = (emailAddress, el) => {
    fastdom.write(() => {
        hideInputAndShowPreview(el);
        $(`.${classes.textInput}`, el).val(emailAddress);
    });
};

const showSecondStageSignup = buttonEl => {
    fastdom.write(() => {
        buttonEl.setAttribute('type', 'button');
        bean.on(buttonEl, 'click', () => {
            showSignupForm(buttonEl);
        });
    });
};

const enhanceNewsletters = () => {
    if (Id.getUserFromCookie() !== null) {
        // email address is not stored in the cookie, gotta go to the Api
        Id.getUserFromApi(userFromId => {
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

const init = () => {
    enhanceNewsletters();
};

export { init };
