// @flow

/**
    Formstack - composer integration

    This script runs INSIDE a formstack iframe and is initialised by the NGW
    requireJs setup

    It is set up to send messages to the parent script in window.top to allow
    the cross domain adjustment of height for variable content from formstack.

    It also takes care of removing the formstack default styling and applying
    Guardian styling via the NGW scss system.

     - Chris Finch, CSD - Identity, March '14
*/

import idApi from 'common/modules/identity/api';

class Formstack {
    static postMessage(type, value, x, y): void {
        const message = {
            type,
            value,
            href: window.location.href,
        };

        if (x) {
            message.x = x;
        }

        if (y) {
            message.y = y;
        }

        window.top.postMessage(JSON.stringify(message), '*');
    }

    constructor(el, formstackId, config): void {
        this.el = el;
        this.dom = {};
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
                hide: 'is-hidden',
            },
            fsSelectors: {
                form: `#fsForm${this.formId}`,
                field: '.fsRow',
                note: '.fsSupporting, .showMobile',
                label: '.fsLabel',
                checkboxLabel: '.fsOptionLabel',
                textInput:
                    '.fsField[type="text"], .fsField[type="email"], .fsField[type="number"], .fsField[type="tel"]',
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
                hide: '.hidden, .fsHidden, .ui-datepicker-trigger',
            },
            hiddenSelectors: {
                userId: '[type="number"]',
                email: '[type="email"]',
            },
        };

        this.config = Object.assign({}, defaultConfig, config);
    }

    init(): void {
        // User object required to populate fields
        const user = idApi.getUserOrSignIn();

        this.dom(user);

        this.el.classList.remove(this.config.idClasses.hide);
        document.documentElement.classList.add('iframed--overflow-hidden');

        // Update iframe height
        this.sendHeight();
    }

    dom(user): void {
        const form = document.getElementById(this.config.fsSelectors.form);

        if (!form) {
            return;
        }

        this.dom.form = form;

        // Formstack generates some awful HTML, so we'll remove the CSS links,
        // loop their selectors and add our own classes instead
        this.dom.form.classList.add(this.config.idClasses.form);

        const links = this.el.getElementsByTagName('link');

        [...links].forEach(link => {
            link.remove();
        });

        Object.keys(this.config.fsSelectors).forEach(key => {
            const selector = this.config.fsSelectors[key];
            const elems = this.dom.form.querySelectorAll(selector);
            const classNames = this.config.idClasses[key].split(' ');

            [...elems].forEach(elem => {
                classNames.forEach(className => {
                    elem.classList.add(className);
                });
            });
        });

        // Formstack also don't have capturable hidden fields,
        // so we remove ID text inputs and append hidden equivalents
        const userId = this.dom.form.querySelector(
            this.config.hiddenSelectors.userId
        );

        if (userId) {
            userId.remove();
        }

        const email = this.dom.form.querySelector(
            this.config.hiddenSelectors.email
        );

        if (email) {
            email.remove();
        }

        const html = `<input type="hidden" name="${userId.getAttribute(
            'name'
        )}" value="${user.id}">
                        <input type="hidden" name="${email.getAttribute(
                            'name'
                        )}" value="${user.primaryEmailAddress}">`;

        this.dom.form.insertAdjacentHTML(html);

        // Events
        window.addEventListener('unload', () => {
            // Listen for navigation to success page
            this.sendHeight(true);
        });

        this.dom.form.addEventListener('submit', event => {
            this.submit(event);
        });

        // Listen for message from top window,
        // only message we are listening for is the iframe position..
        window.addEventListener(
            'message',
            event => {
                const message = JSON.parse(event.data);

                if (message.iframeTop) {
                    this.postMessage(
                        'scroll-to',
                        'scroll-to',
                        0,
                        message.iframeTop
                    );
                }
            },
            false
        );
    }

    submit(event): void {
        const triggerKeyUp = el => {
            const e = document.createEvent('HTMLEvents');
            e.initEvent('keyup', false, true);
            el.dispatchEvent(e);
        };

        event.preventDefault();

        setTimeout(() => {
            // Remove any existing errors
            const formErrorClass = this.config.idClasses.formError;
            const formErrors = document.getElementsByClassName(formErrorClass);

            [...formErrors].forEach(formError => {
                formError.classList.remove(formErrorClass);
            });

            const fieldErrorClass = this.config.idClasses.fieldError;
            const fieldErrors = document.getElementsByClassName(
                fieldErrorClass
            );

            [...fieldErrors].forEach(fieldError => {
                fieldError.classList.remove(fieldErrorClass);
            });

            // Handle new errors
            const fsFormErrorClass = this.config.fsSelectors.formError;
            const fsFormErrors = this.dom.form.getElementsByClassName(
                fsFormErrorClass
            );

            [...fsFormErrors].forEach(fsFormError => {
                fsFormError.classList.add(formErrorClass);
            });

            const fsFieldErrorClass = this.config.fsSelectors.fieldError;
            const fsFieldErrors = this.dom.form.getElementsByClassName(
                fsFieldErrorClass
            );

            [...fsFieldErrors].forEach(fsFieldError => {
                fsFieldError.classList.add(fieldErrorClass);
            });

            // Update character count absolute positions
            const textAreas = this.el.querySelectorAll(
                this.config.fsSelectors.textArea
            );

            [...textAreas].forEach(textArea => {
                triggerKeyUp(textArea);
            });

            this.postMessage('get-position', 'get-position');

            // if no errors, submit form
            if (fsFormErrors.length === 0) {
                this.dom.form.submit();
            }
        }, 100);
    }

    sendHeight(): void {
        const body = document.body;

        if (!document.body) {
            return;
        }

        const html = document.documentElement;
        const height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
        );

        this.postMessage('set-height', height);
    }
}

export default Formstack;
