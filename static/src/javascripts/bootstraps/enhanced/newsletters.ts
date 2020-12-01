
import bean from "bean";
import fastdom from "fastdom";
import $ from "lib/$";
import fetch from "lib/fetch";
import config from "lib/config";
import { getUserFromCookie, getUserFromApi } from "common/modules/identity/api";

const classes = {
  wrapper: 'js-newsletter-meta',
  signupForm: 'js-email-sub__form',
  textInput: 'js-newsletter-card__text-input',
  signupButton: 'js-newsletter-signup-button',
  styleSignup: 'newsletter-card__lozenge--submit',
  signupConfirm: 'js-signup-confirmation',
  previewButton: 'js-newsletter-preview'
};

const inputs = {
  email: 'email',
  dummy: 'name'
};

const hideInputAndShowPreview = (el: Node | null | undefined): void => {
  fastdom.mutate(() => {
    $(`.${classes.textInput}`, el).addClass('is-hidden');
    $(`.${classes.signupButton}`, el).removeClass(classes.styleSignup);
    $(`.${classes.previewButton}`, el).removeClass('is-hidden');
  });
};

const validate = (form: HTMLFormElement | null | undefined): boolean => {
  // simplistic email address validation
  const emailAddress = $(`.${classes.textInput}`, form).val();
  return typeof emailAddress === 'string' && emailAddress.indexOf('@') > -1;
};

const addSubscriptionMessage = (buttonEl: HTMLButtonElement): void => {
  const meta = $.ancestor(buttonEl, classes.wrapper);
  fastdom.mutate(() => {
    $(buttonEl.form).addClass('is-hidden');
    $(`.${classes.previewButton}`, meta).addClass('is-hidden');
    $(`.${classes.signupConfirm}`, meta).removeClass('is-hidden');
  });
};

const modifyDataLinkName = (modifier: string) => (el: HTMLButtonElement): void => {
  const firstStageName = el.getAttribute('data-link-name') || "undefined-data-link-name";
  el.setAttribute('data-link-name', firstStageName + modifier);
};

const modifyLinkNamesForSecondStage = (el: HTMLButtonElement) => modifyDataLinkName('-second-stage')(el);

const modifyLinkNamesForSignedInUser = (el: HTMLButtonElement) => modifyDataLinkName('-signed-in')(el);

const submitForm = (form: HTMLFormElement | null | undefined, buttonEl: HTMLButtonElement): Promise<void> => {
  const dummyEmail = encodeURIComponent($(`input[name="${inputs.dummy}"]`, form).val()); // Used as a 'bot-bait', see https://stackoverflow.com/a/34623588/2823715
  const email = encodeURIComponent($(`input[name="${inputs.email}"]`, form).val());
  const listName = encodeURIComponent($('input[name="listName"]', form).val());
  const csrfToken = encodeURIComponent($('input[name="csrfToken"]', form).val());
  const formQueryString = `${inputs.email}=${email}&csrfToken=${csrfToken}&listName=${listName}&${inputs.dummy}=${dummyEmail}`;

  return fetch(`${config.get('page.ajaxUrl')}/email`, {
    method: 'POST',
    body: formQueryString,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(response => {
    if (response.ok) {
      addSubscriptionMessage(buttonEl);
    }
  });
};

const createSubscriptionFormEventHandlers = (buttonEl: HTMLButtonElement): void => {
  bean.on(buttonEl, 'click', event => {
    event.preventDefault();
    const form = buttonEl.form;
    if (validate(form)) {
      submitForm(form, buttonEl);
    }
  });
};

const modifyFormForSignedIn = el => {
  modifyLinkNamesForSignedInUser(el);
  createSubscriptionFormEventHandlers(el);
};

const showSignupForm = (buttonEl: HTMLButtonElement): void => {
  const form = buttonEl.form;
  const meta = $.ancestor(buttonEl, 'js-newsletter-meta');
  fastdom.mutate(() => {
    $(`.${classes.textInput}`, form).removeClass('is-hidden').focus();
    $(`.${classes.signupButton}`, form).addClass(classes.styleSignup);
    $(`.${classes.previewButton}`, meta).addClass('is-hidden');
    modifyLinkNamesForSecondStage(buttonEl);
    createSubscriptionFormEventHandlers(buttonEl);
  });
};

const updatePageForLoggedIn = (emailAddress: string, el: Node | null | undefined): void => {
  fastdom.mutate(() => {
    hideInputAndShowPreview(el);
    $(`.${classes.textInput}`, el).val(emailAddress);
  });
};

const showSecondStageSignup = (buttonEl: HTMLButtonElement): void => {
  fastdom.mutate(() => {
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
        $.forEachElement(`.${classes.signupButton}`, modifyFormForSignedIn);
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