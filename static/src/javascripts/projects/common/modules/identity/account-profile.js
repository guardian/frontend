/* global XDomainRequest */

/*
 *  Handle History updates and monitor for unsaved changes on account profile
 *  forms.
 */
define([
    'common/utils/$',
    'bean',
    'bonzo',
    'common/utils/url',
    'common/utils/config',
    'common/utils/ajax',
    'common/modules/avatar/api'
], function (
    $,
    bean,
    bonzo,
    url,
    config,
    ajax,
    avatarApi
) {

    var accountProfile = function () {

        var self = this;

        self.classes = {
            forms: '.js-account-profile-forms',
            accountForm: '.js-account-details-form',
            publicForm: '.js-public-profile-form',
            tabs: '.js-tabs',
            formError: '.form__error',
            formSuccess: '.form__success',
            changed: 'js-form-changed',
            textInput: '.text-input',
            avatarUploadForm: '.js-avatar-upload-form',
            avatarUploadButton: '.js-avatar-upload-button',
            memberShipContainer: '.js-memebership-tab-container'
        };

        self.messages = {
            noServerError: 'Sorry, the Avatar upload service is currently unavailable. Please try again shortly.',
            avatarUploadSuccess: 'Thank you for uploading your avatar. It will be checked by Guardian moderators shortly.',
            avatarUploadFailure: 'Sorry, something went wrong. Please try again.'
        };

        self.unsavedFields = [];

        return {
            init: function () {

                self.accountProfileForms = document.body.querySelector(self.classes.forms);

                if (self.accountProfileForms) {

                    self.bindAvatarUpload();

                    self.bindInputs(self.accountProfileForms.querySelector(self.classes.accountForm));
                    self.bindInputs(self.accountProfileForms.querySelector(self.classes.publicForm));

                    var tabs = self.accountProfileForms.querySelector(self.classes.tabs);

                    require(['bootstraps/enhanced/membership'], function (membershipTab) {
                        membershipTab.init();
                    });

                    $(self.classes.tabs + ' .tabs__tab a').each(function () { // enhance tab urls to work with JS tabs module
                        this.href = this.getAttribute('data-tabs-href');
                    });

                    bean.on(tabs, 'click', self.handleTabsClick.bind(self));
                }
            }
        };
    };

    /*
    *   Handle click on form tabs, change history if necessary and render error
    *   message if form contains unsaved changes.
    */
    accountProfile.prototype.handleTabsClick = function (event) {
        var self = this;
        if (event.target.nodeName.toLowerCase() === 'a') {
            if (self.unsavedChangesForm) {
                event.preventDefault();
                event.stopImmediatePropagation();
                // Prevent multiple errors from appearing
                if (!self.unsavedChangesForm.querySelector(self.classes.formError)) {
                    // Append error message
                    bonzo(self.unsavedChangesForm).prepend(self.genUnsavedError());
                    // Bind form submit to error message 'save' action
                    bean.on(self.unsavedChangesForm.querySelector('.js-save-unsaved'), 'click', function () {
                        self.unsavedChangesForm.submit();
                    });
                }
            } else {
                url.pushUrl({}, event.target.innerHTML, event.target.getAttribute('data-pushstate-url'));
            }
        }
    };

    accountProfile.prototype.avatarUploadByApi = function (avatarForm) {
        var self = this;
        var formData = new FormData(document.querySelector('form' + self.classes.avatarUploadForm));

        // disable form while submitting to prevent overlapping submissions
        document.querySelector(self.classes.avatarUploadButton).disabled = true;

        avatarApi.updateAvatar(formData)
            .then(function () {
                self.prependSuccessMessage(self.messages.avatarUploadSuccess, avatarForm);
            }, function (err) {
                if (err.status >= 400 && err.status < 500) {
                    self.prependErrorMessage(
                        JSON.parse(err.responseText).message || self.messages.avatarUploadFailure,
                        avatarForm);
                } else {
                    self.prependErrorMessage(self.messages.noServerError, avatarForm);
                }

                document.querySelector(self.classes.avatarUploadButton).disabled = false;
            });
    };

    /*
    *   Handle user avatar upload
    *   TO DO: Use html5 file api to validate file size prior to upload @chrisfinch
    */
    accountProfile.prototype.bindAvatarUpload = function () {
        var self = this,
            avatarForm = self.accountProfileForms.querySelector(self.classes.avatarUploadForm);

        if (avatarForm) {
            bean.on(avatarForm, 'submit', function (event) {
                event.preventDefault();

                self.avatarUploadByApi(avatarForm);
            });
        }

    };

    accountProfile.prototype.prependMessage = function (message, location, clazz) {
        var errorHtml = document.createElement('div');
        errorHtml.innerHTML = message;
        errorHtml.className = clazz;
        location.insertBefore(errorHtml, location.firstChild);
    };

    accountProfile.prototype.prependErrorMessage = function (message, location) {
        var errorClass = this.classes.formError.replace('.', '');
        this.prependMessage(message, location, errorClass);
    };

    accountProfile.prototype.prependSuccessMessage = function (message, location) {
        var errorClass = this.classes.formSuccess.replace('.', '');
        this.prependMessage(message, location, errorClass);
    };

    /*
    *   Generate a descriptive error message for when a user attempts to leave
    *   a form with unsaved changes.
    */
    accountProfile.prototype.genUnsavedError = function () {
        var i, labelId, text,
            errorDivStart = '<div class="form__error">',
            errorDivEnd = '</div>',
            errorSaveLink = '<a href="#" class="js-save-unsaved">Save changes</a>',
            errorMessageStart = 'Your form has unsaved changes in ';

        for (i = 0; i < this.unsavedFields.length; i++) {
            labelId = this.unsavedFields[i].id;
            text = this.accountProfileForms.querySelector('[for="' + labelId + '"]').innerHTML;
            errorMessageStart += '"' + text + '"';
            if (i === this.unsavedFields.length - 1) {
                errorMessageStart += '. ';
            } else if (i === this.unsavedFields.length - 2) {
                errorMessageStart += ' and ';
            } else {
                errorMessageStart += ', ';
            }
        }

        return errorDivStart + errorMessageStart + errorSaveLink + errorDivEnd;
    };

    /*
    *   Register a form and form field as containing unsaved changes
    */
    accountProfile.prototype.onInputChange = function (event) {
        bonzo(event.target.form).addClass(this.classes.changed);
        this.unsavedChangesForm = event.target.form;
        if (!this.unsavedFields.some(function (el) { return el === event.target; })) {
            this.unsavedFields.push(event.target);
        }
    };

    /*
    *   Bind keyup events on input fields and register parent form on element
    */
    accountProfile.prototype.bindInputs = function (form) {
        var i, input,
            inputs = Array.prototype.slice.call(form.querySelectorAll(this.classes.textInput));
        inputs = inputs.concat(Array.prototype.slice.call(form.querySelectorAll('select')));
        for (i = inputs.length - 1; i >= 0; i--) {
            input = inputs[i];
            input.form = form;
            if (input.type === 'select-one') {
                input.addEventListener('change', this.onInputChange.bind(this));
            } else {
                input.addEventListener('input', this.onInputChange.bind(this));
            }
        }
    };

    return accountProfile;

}); // define
