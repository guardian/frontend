import config from 'lib/config';
import { getUserOrSignIn } from 'common/modules/identity/api';

// TODO: Remove repitition with common/modules/identity/formstack-iframe-embed
class Formstack {
    el;
    form;
    formId;
    config;

    constructor(el, formstackId) {
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

    postMessage(message) {
        const domain = this.config.page.idUrl;

        window.top.postMessage(message, domain);
    }

    init() {
        // User object required to populate fields
        let user = getUserOrSignIn('signin_from_formstack');

        if (!user) {
            user = {};
        }

        this.dom(user);

        this.el.classList.remove(this.config.idClasses.hide);

        if (document.documentElement) {
            document.documentElement.classList.add('iframed--overflow-hidden');
        }

        // Update iframe height
        this.postMessage('ready');
    }

    dom(user) {
        const form = (document.getElementById(
            this.config.fsSelectors.form
        ));

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
        const userId = this.form.querySelector(
            this.config.hiddenSelectors.userId
        );

        if (!userId) {
            return;
        }

        userId.remove();

        const email = this.form.querySelector(
            this.config.hiddenSelectors.email
        );

        if (!email) {
            return;
        }

        email.remove();

        const userName = userId.getAttribute('name') || '';

        const emailName = email.getAttribute('name') || '';

        const html = `<input type="hidden" name="${userName}" value="${
            user.id
        }">
                        <input type="hidden" name="${emailName}" value="${
            user.primaryEmailAddress
        }">`;

        this.form.insertAdjacentHTML('beforeend', html);

        // Events
        window.addEventListener('unload', () => {
            // Listen for navigation to success page
            this.postMessage('unload');
        });

        this.form.addEventListener('submit', () => {
            this.submit();
        });
    }

    submit() {
        const triggerKeyUp = el => {
            const e = document.createEvent('HTMLEvents');
            e.initEvent('keyup', false, true);
            el.dispatchEvent(e);
        };

        setTimeout(() => {
            // Remove any existing errors
            const formErrorClass = this.config.idClasses.formError;
            const formErrors = Array.from(
                document.getElementsByClassName(formErrorClass)
            );

            formErrors.forEach(formError => {
                formError.classList.remove(formErrorClass);
            });

            const fieldErrorClass = this.config.idClasses.fieldError;
            const fieldErrors = Array.from(
                document.getElementsByClassName(fieldErrorClass)
            );

            fieldErrors.forEach(fieldError => {
                fieldError.classList.remove(fieldErrorClass);
            });

            // Handle new errors
            const fsFormErrorClass = this.config.fsSelectors.formError;
            const fsFormErrors = Array.from(
                this.form.getElementsByClassName(fsFormErrorClass)
            );

            fsFormErrors.forEach(fsFormError => {
                fsFormError.classList.add(formErrorClass);
            });

            const fsFieldErrorClass = this.config.fsSelectors.fieldError;
            const fsFieldErrors = Array.from(
                this.form.getElementsByClassName(fsFieldErrorClass)
            );

            fsFieldErrors.forEach(fsFieldError => {
                fsFieldError.classList.add(fieldErrorClass);
            });

            // Update character count absolute positions
            const textAreas = Array.from(
                this.el.querySelectorAll(this.config.fsSelectors.textArea)
            );

            textAreas.forEach(textArea => {
                triggerKeyUp(textArea);
            });

            this.postMessage('refreshHeight');
        }, 100);
    }
}

export { Formstack };
