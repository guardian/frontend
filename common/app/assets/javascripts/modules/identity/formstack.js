define([
    '$',
    'common',
    'bean',
    'modules/identity/api'
], function (
    $,
    common,
    bean,
    idApi
) {

    function Formstack(el, formstackId, context, config) {

        config = common.extend({
            classes: {
                form: 'form',
                field: 'form-field',
                note: 'form-field__note form-field__note--below',
                label: 'label',
                textInput: 'text-input',
                textArea: 'textarea',
                submit: 'submit-input',
                fieldError: 'form-field--error',
                formError: 'form__error',
                hide: 'u-h',
                ready: 'form-ready'
            },
            selectors: {
                fsForm: '#fsForm',
                fsHeader: '.fsSectionHeader',
                fsBody: '.fsBody',
                fsField: '.fsRow',
                fsNote: '.fsSupporting, .showMobile',
                fsLabel: '.fsLabel',
                fsTextInput: '.fsField[type="text"], .fsField[type="email"], .fsField[type="number"], .fsField[type="tel"]',
                fsTextArea: 'textarea.fsField',
                fsSubmit: '.fsSubmitButton',
                fsFormError: '.fsError',
                fsFieldError: '.fsValidationError',
                fsHide: '.hidden, .fsHidden, .fsRequiredMarker',
                fsIdUser: '[type="number"]',
                fsIdEmail: '[type="email"]'
            }
        }, config);

        var self = this,
            dom = {},
            user = {},
            formId = formstackId.split('-')[0];

        self.init = function() {
            if (!$(el).hasClass(config.classes.ready)) {

                // User object required to populate fields
                user = idApi.getUserOrSignIn();

                self.dom();
                self.populate();
                self.decorate();

                $(el).addClass(config.classes.ready).removeClass(config.classes.hide);
            }
        };

        self.dom = function() {
            // TODO: Setup DOM, not like this:
            dom.$form = $(config.selectors.fsForm + formId);
            dom.$formHeader = $(config.selectors.fsHeader);
            dom.$formBody = $(config.selectors.fsBody);

            dom.$fields = $(config.selectors.fsField, dom.$form);
            dom.$notes = $(config.selectors.fsNote, dom.$form);
            dom.$labels = $(config.selectors.fsLabel, dom.$form);

            dom.$textInput = $(config.selectors.fsTextInput, dom.$form);
            dom.$textArea = $(config.selectors.fsTextArea, dom.$form);
            dom.$submit = $(config.selectors.fsSubmit, dom.$form);
            dom.$hide = $(config.selectors.fsHide, dom.$form);

            dom.$idUser = $(config.selectors.fsIdUser, dom.$form);
            dom.$idEmail = $(config.selectors.fsIdEmail, dom.$form);

            dom.$cssLinks = $('link', dom.$formBody);

            // Events
            bean.on(dom.$form[0], 'submit', self.submit);
        };

        self.populate = function() {
            dom.$idUser.val(user.id);
            dom.$idEmail.val(user.primaryEmailAddress);
        };

        self.decorate = function() {
            // Remove Formstack styles
            dom.$cssLinks.remove();

            // Add our form classes to pick up Identity styles
            dom.$form.addClass(config.classes.form);
            dom.$fields.addClass(config.classes.field);
            dom.$notes.addClass(config.classes.note);
            dom.$labels.addClass(config.classes.label);

            dom.$textInput.addClass(config.classes.textInput);
            dom.$textArea.addClass(config.classes.textArea);
            dom.$submit.addClass(config.classes.submit);

            dom.$hide.addClass(config.classes.hide);

            // TODO: not this:
            dom.$formHeader.css({ 'margin-bottom': '24px' });
            $('.fsPage').css({ 'margin-top': '16px' });
        };

        self.submit = function(event) {
            self.errors();
        };

        self.errors = function() {
            // TODO: FML
            setInterval(function() {
                // Remove any existing errors
                $('.' + config.classes.formError).removeClass(config.classes.formError);
                $('.' + config.classes.fieldError).removeClass(config.classes.fieldError);

                // Update errors
                $(config.selectors.fsFieldError, dom.$form).addClass(config.classes.fieldError);
                $(config.selectors.fsFormError, dom.$form).addClass(config.classes.formError);
            }, 100);
        };

    }

    return Formstack;

});
