define([
    'bean',
    'common/utils/$',
    'common/modules/identity/api',
    'lodash/objects/assign'
], function (
    bean,
    $,
    idApi,
    assign) {

    function Formstack(el, formstackId, config) {

        var self = this,
            dom = {},
            formId = formstackId.split('-')[0];

        config = assign({
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
                form: '#fsForm' + formId,
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
        }, config);

        self.init = function () {
            // User object required to populate fields
            var user = idApi.getUserOrSignIn();

            self.dom(user);
            $(el).removeClass(config.idClasses.hide);
            $('html').addClass('iframed--overflow-hidden');

            // Update iframe height, see "modules/identity/formstack-iframe"
            self.postMessage('ready');
        };

        self.dom = function (user) {
            var selector, $userId, $email, html;

            // Formstack generates some awful HTML, so we'll remove the CSS links,
            // loop their selectors and add our own classes instead
            dom.$form = $(config.fsSelectors.form).addClass(config.idClasses.form);
            $('link', el).remove();

            for (selector in config.fsSelectors) {
                $(config.fsSelectors[selector], dom.$form).addClass(config.idClasses[selector]);
            }

            // Formstack also don't have capturable hidden fields,
            // so we remove ID text inputs and append hidden equivalents
            $userId = $(config.hiddenSelectors.userId, dom.$form).remove();
            $email = $(config.hiddenSelectors.email, dom.$form).remove();

            html = '<input type="hidden" name="' + $userId.attr('name') + '" value="' + user.id + '">'
                 + '<input type="hidden" name="' + $email.attr('name') + '" value="' + user.primaryEmailAddress + '">';

            dom.$form.append(html);

            // Events
            bean.on(window, 'unload', self.unload);
            bean.on(dom.$form[0], 'submit', self.submit);
        };

        self.submit = function () {
            // TODO: FML
            setTimeout(function () {
                // Remove any existing errors
                $('.' + config.idClasses.formError).removeClass(config.idClasses.formError);
                $('.' + config.idClasses.fieldError).removeClass(config.idClasses.fieldError);

                // Handle new errors
                $(config.fsSelectors.formError, dom.$form).addClass(config.idClasses.formError);
                $(config.fsSelectors.fieldError, dom.$form).addClass(config.idClasses.fieldError);

                // Update character count absolute positions
                $(config.fsSelectors.textArea, el).each(function (textarea) {
                    bean.fire(textarea, 'keyup');
                });

                self.postMessage('refreshHeight');
            }, 100);
        };

        self.unload = function () {
            // Listen for navigation to success page
            self.postMessage('unload');
        };

        self.postMessage = function (message) {
            var domain = config.page.idUrl;
            window.top.postMessage(message, domain);
        };

    }

    return Formstack;

});
