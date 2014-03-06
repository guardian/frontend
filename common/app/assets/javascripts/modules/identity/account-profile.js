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
            textInput: '.text-input'
        };

        self.unsavedFields = [];

        return {
            init: function (context) {

                var accountProfileForms = context.querySelector(self.classes.forms);

                if (accountProfileForms) {
                    self.bindInputs(accountProfileForms.querySelector(self.classes.accountForm));
                    self.bindInputs(accountProfileForms.querySelector(self.classes.publicForm));

                    var tabs = accountProfileForms.querySelector(self.classes.tabs);

                    bean.on(tabs, 'click', self.handleTabsClick.bind(self));
                }
            }
        };
    };

    /*
     *  Handle click on form tabs, change history if necessary and render error
     *  message if form contains unsaved changes.
     */
    accountProfile.prototype.handleTabsClick = function(event) {
        var self = this;
        if (event.target.nodeName.toLowerCase() === "a") {
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
                url.pushUrl({}, event.target.innerHTML, event.target.getAttribute("data-pushstate-url"));
            }
        }
    };

    /*
     *  Generate a descriptive error message for when a user attempts to leave
     *  a form with unsaved changes.
     */
    accountProfile.prototype.genUnsavedError = function () {
        var errorDivStart = "<div class='form__error'>",
            errorDivEnd = "</div>",
            errorSaveLink = "<a href='#' class='js-save-unsaved'>Save changes</a>",
            errorMessageStart = "Your form has unsaved changes in ";

        for (var i = 0; i < this.unsavedFields.length; i++) {
            errorMessageStart += "'" + this.unsavedFields[i].labels[0].innerHTML + "'";
            if (i === this.unsavedFields.length-1) {
                errorMessageStart += ". ";
            } else if (i === this.unsavedFields.length-2) {
                errorMessageStart += " and ";
            } else {
                errorMessageStart += ", ";
            }
        }

        return errorDivStart + errorMessageStart + errorSaveLink + errorDivEnd;
    };

    /*
     *  Register a form and form field as containing unsaved changes
     */
    accountProfile.prototype.onInputChange = function (event) {
        bonzo(event.target.form).addClass(this.classes.changed);
        this.unsavedChangesForm = event.target.form;
        if (!this.unsavedFields.some(function (el) { return el === event.target; })) {
            this.unsavedFields.push(event.target);
        }
    };

    /*
     *  Bind keyup events on input fields and register parent form on element
     */
    accountProfile.prototype.bindInputs = function (form) {
        var inputs = Array.prototype.slice.call(form.querySelectorAll(this.classes.textInput));
        for (var i = inputs.length - 1; i >= 0; i--) {
            inputs[i].form = form;
            inputs[i].addEventListener("input", this.onInputChange.bind(this));
        }
    };

    return accountProfile;

}); // define
