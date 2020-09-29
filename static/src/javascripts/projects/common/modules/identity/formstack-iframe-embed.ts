

/**
    Formstack - composer integration

    This script runs INSIDE a formstack iframe.

    It is set up to send messages to the parent script in window.top to allow
    the cross domain adjustment of height for variable content from formstack.

    It also takes care of removing the formstack default styling and applying
    Guardian styling via the NGW scss system.

     - Chris Finch, CSD - Identity, March '14
*/

import config from "lib/config";
import { getUserOrSignIn } from "common/modules/identity/api";

const postMessage = (type: string, value: string | number, x?: number, y?: number): void => {
  const message: {
    type: string;
    value: string | number;
    href: string;
    x?: number;
    y?: number;
  } = {
    type,
    value,
    href: window.location.href
  };

  if (x) {
    message.x = x;
  }

  if (y) {
    message.y = y;
  }

  window.top.postMessage(JSON.stringify(message), '*');
};

const sendHeight = (): void => {
  const body = document.body;
  const html = document.documentElement;

  if (body && html) {
    const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    postMessage('set-height', height);
  }
};

// TODO: Remove repitition with common/modules/identity/formstack
class FormstackEmbedIframe {

  el: HTMLElement;
  form: HTMLFormElement;
  formId: string;
  config: Object;

  constructor(el: HTMLElement, formstackId: string): void {
    this.el = el;
    this.formId = formstackId.split('-')[0];

    const defaultConfig = {
      idClasses: {
        form: 'form',
        field: 'form-field',
        note: 'form-field__note form-field__note--below',
        label: 'label',
        checkboxLabel: 'check-label',
        textInput: 'text-input',
        textArea: 'textarea textarea--no-resize',
        submit: 'submit-input',
        fieldError: 'form-field--error',
        formError: 'form__error',
        fieldset: 'formstack-fieldset',
        required: 'formstack-required',
        sectionHeader: 'formstack-heading',
        sectionHeaderFirst: 'formstack-heading--first',
        sectionText: 'formstack-section',
        characterCount: 'formstack-count',
        hide: 'is-hidden'
      },
      fsSelectors: {
        form: `#fsForm${this.formId}`,
        field: '.fsRow',
        note: '.fsSupporting, .showMobile',
        label: '.fsLabel',
        checkboxLabel: '.fsOptionLabel',
        textInput: '.fsField[type="text"], .fsField[type="email"], .fsField[type="number"], .fsField[type="tel"]',
        textArea: 'textarea.fsField',
        submit: '.fsSubmitButton',
        fieldError: '.fsValidationError',
        formError: '.fsError',
        fieldset: 'fieldset',
        required: '.fsRequiredMarker',
        sectionHeader: '.fsSectionHeading',
        sectionHeaderFirst: '.fsSection:first-child .fsSectionHeading',
        sectionText: '.fsSectionText',
        characterCount: '.fsCounter',
        hide: '.hidden, .fsHidden, .ui-datepicker-trigger'
      },
      hiddenSelectors: {
        userId: '[type="number"]',
        email: '[type="email"]'
      }
    };

    this.config = Object.assign({}, defaultConfig, config);
  }

  init(): void {
    // User object required to populate fields
    const user = getUserOrSignIn('signin_from_formstack');

    if (!user) {
      return;
    }

    this.dom(user);

    this.el.classList.remove(this.config.idClasses.hide);

    if (document.documentElement) {
      document.documentElement.classList.add('iframed--overflow-hidden');
    }

    // Update iframe height
    sendHeight();
  }

  dom(user: Object): void {
    const form: HTMLFormElement = (document.getElementById(this.config.fsSelectors.form) as any);

    if (!form) {
      return;
    }

    this.form = form;

    // Formstack generates some awful HTML, so we'll remove the CSS links,
    // loop their selectors and add our own classes instead
    this.form.classList.add(this.config.idClasses.form);

    const links = Array.from(this.el.getElementsByTagName('link'));

    links.forEach(link => {
      link.remove();
    });

    Object.keys(this.config.fsSelectors).forEach(key => {
      const selector = this.config.fsSelectors[key];
      const elems = Array.from(this.form.querySelectorAll(selector));
      const classNames = this.config.idClasses[key].split(' ');

      elems.forEach(elem => {
        classNames.forEach(className => {
          elem.classList.add(className);
        });
      });
    });

    // Formstack also don't have capturable hidden fields,
    // so we remove ID text inputs and append hidden equivalents
    const userId = this.form.querySelector(this.config.hiddenSelectors.userId);

    if (!userId) {
      return;
    }

    userId.remove();

    const email = this.form.querySelector(this.config.hiddenSelectors.email);

    if (!email) {
      return;
    }

    email.remove();

    const userName = userId.getAttribute('name') || '';

    const emailName = email.getAttribute('name') || '';

    const html = `<input type="hidden" name="${userName}" value="${user.id}">
                        <input type="hidden" name="${emailName}" value="${user.primaryEmailAddress}">`;

    this.form.insertAdjacentHTML('beforeend', html);

    // Events
    window.addEventListener('unload', () => {
      // Listen for navigation to success page
      sendHeight();
    });

    this.form.addEventListener('submit', event => {
      this.submit(event);
    });

    // Listen for message from top window,
    // only message we are listening for is the iframe position..
    window.addEventListener('message', event => {
      const message = JSON.parse(event.data);

      if (message.iframeTop) {
        postMessage('scroll-to', 'scroll-to', 0, message.iframeTop);
      }
    }, false);
  }

  submit(event: Event): void {
    const triggerKeyUp = el => {
      const e = document.createEvent('HTMLEvents');
      e.initEvent('keyup', false, true);
      el.dispatchEvent(e);
    };

    event.preventDefault();

    setTimeout(() => {
      // Remove any existing errors
      const formErrorClass = this.config.idClasses.formError;
      const formErrors = Array.from(document.getElementsByClassName(formErrorClass));

      formErrors.forEach(formError => {
        formError.classList.remove(formErrorClass);
      });

      const fieldErrorClass = this.config.idClasses.fieldError;
      const fieldErrors = Array.from(document.getElementsByClassName(fieldErrorClass));

      fieldErrors.forEach(fieldError => {
        fieldError.classList.remove(fieldErrorClass);
      });

      // Handle new errors
      const fsFormErrorClass = this.config.fsSelectors.formError;
      const fsFormErrors = Array.from(this.form.getElementsByClassName(fsFormErrorClass));

      fsFormErrors.forEach(fsFormError => {
        fsFormError.classList.add(formErrorClass);
      });

      const fsFieldErrorClass = this.config.fsSelectors.fieldError;
      const fsFieldErrors = Array.from(this.form.getElementsByClassName(fsFieldErrorClass));

      fsFieldErrors.forEach(fsFieldError => {
        fsFieldError.classList.add(fieldErrorClass);
      });

      // Update character count absolute positions
      const textAreas = Array.from(this.el.querySelectorAll(this.config.fsSelectors.textArea));

      textAreas.forEach(textArea => {
        triggerKeyUp(textArea);
      });

      postMessage('get-position', 'get-position');

      // if no errors, submit form
      if (fsFormErrors.length === 0) {
        this.form.submit();
      }
    }, 100);
  }
}

export { FormstackEmbedIframe };