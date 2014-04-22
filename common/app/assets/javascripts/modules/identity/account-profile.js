/* global XDomainRequest */

/*
 *  Handle History updates and monitor for unsaved changes on account profile
 *  forms.
 */
define([
    'bean',
    'bonzo',
    'common/utils/url'
], function(
    bean,
    bonzo,
    url
) {

    var accountProfile = function () {

        var self = this;

        self.classes = {
            forms: '.js-account-profile-forms',
            accountForm: '.js-account-details-form',
            publicForm: '.js-public-profile-form',
            tabs: '.js-tabs',
            formError: '.form__error',
            changed: 'js-form-changed',
            textInput: '.text-input',
            avatarUploadForm: '.js-avatar-upload-form'
        };

        self.messages = {
            noCorsError: 'Cross-origin resource sharing is not supported by this browser. Please upgrade your browser to use this feature.',
            noServerError: 'The image upload server could not be reached.'
        };

        self.urls = {
            avatarTokenUrl: 'https://gu-image-upload.appspot.com/upload-endpoint-generator'
        };

        self.unsavedFields = [];

        return {
            init: function (context) {

                self.accountProfileForms = context.querySelector(self.classes.forms);

                if (self.accountProfileForms) {

                    self.bindAvatarUpload();

                    self.bindInputs(self.accountProfileForms.querySelector(self.classes.accountForm));
                    self.bindInputs(self.accountProfileForms.querySelector(self.classes.publicForm));

                    var tabs = self.accountProfileForms.querySelector(self.classes.tabs);

                    bean.on(tabs, 'click', self.handleTabsClick.bind(self));
                }
            }
        };
    };

    /*
    *   Handle click on form tabs, change history if necessary and render error
    *   message if form contains unsaved changes.
    */
    accountProfile.prototype.handleTabsClick = function(event) {
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

    /*
    *   Request a new image upload token on submit of the image upload form.
    *   TO DO: Use html5 file api to validate file size prior to upload @chrisfinch
    */
    accountProfile.prototype.bindAvatarUpload = function () {
        var self = this;
        var avatarForm = self.accountProfileForms.querySelector(self.classes.avatarUploadForm);

        if (avatarForm) {
            bean.on(avatarForm, 'submit', function (event) {
                event.preventDefault();

                var xhr = self.createCORSRequest('GET', self.urls.avatarTokenUrl);
                if (!xhr) {
                    self.prependErrorMessage(self.messages.noCorsError, avatarForm);
                }

                xhr.onerror = function() {
                    self.prependErrorMessage(self.messages.noServerError, avatarForm);
                };

                xhr.onload = function() {
                    avatarForm.setAttribute('action', xhr.responseText);
                    avatarForm.submit();
                };

                xhr.send();
            });
        }

    };

    /*
    *   Prepend an error message in to an element
    */
    accountProfile.prototype.prependErrorMessage = function (message, location) {
        var errorHtml = document.createElement('div');
        errorHtml.innerHTML = message;
        errorHtml.className = this.classes.formError.replace('.', '');
        location.insertBefore(errorHtml, location.firstChild);
    };

    /*
    *   Create a cross-origin resource sharing XHR request
    */
    accountProfile.prototype.createCORSRequest = function (method, url) {
        var xhr = new XMLHttpRequest();
        if ('withCredentials' in xhr) {
            xhr.open(method, url, true);
        } else if (typeof XDomainRequest !== 'undefined') {
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            xhr = null; // CORS not supported
        }
        return xhr;
    };

    /*
    *   Generate a descriptive error message for when a user attempts to leave
    *   a form with unsaved changes.
    */
    accountProfile.prototype.genUnsavedError = function () {
        var errorDivStart = '<div class="form__error">',
            errorDivEnd = '</div>',
            errorSaveLink = '<a href="#" class="js-save-unsaved">Save changes</a>',
            errorMessageStart = 'Your form has unsaved changes in ';

        for (var i = 0; i < this.unsavedFields.length; i++) {
            var labelId = this.unsavedFields[i].id;
            var text = this.accountProfileForms.querySelector('[for="'+labelId+'"]').innerHTML;
            errorMessageStart += '"' + text + '"';
            if (i === this.unsavedFields.length-1) {
                errorMessageStart += '. ';
            } else if (i === this.unsavedFields.length-2) {
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
        var inputs = Array.prototype.slice.call(form.querySelectorAll(this.classes.textInput));
        inputs = inputs.concat(Array.prototype.slice.call(form.querySelectorAll('select')));
        for (var i = inputs.length - 1; i >= 0; i--) {
            var input = inputs[i];
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
