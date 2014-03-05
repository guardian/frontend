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

        self.config = {
            errorHtml: "<div class='form__error'>Your form has unsaved changes.</div>"
        };

        self.classes = {
            forms: '.js-account-profile-forms',
            accountForm: '.js-account-details-form',
            publicForm: '.js-public-profile-form',
            tabs: '.js-tabs',
            formError: '.form__error',
            unsaved: 'form-field--unsaved',
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

                    bean.on(tabs, 'click', function (event) {
                        if (event.target.nodeName.toLowerCase() === "a") {

                            url.pushUrl({}, event.target.innerHTML, event.target.getAttribute("data-pushstate-url"));

                            if (self.unsavedChangesForm) {
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                if (!self.unsavedChangesForm.querySelector(self.classes.formError)) {
                                    bonzo(self.unsavedChangesForm).prepend(self.config.errorHtml);
                                }
                                bonzo(self.unsavedFields).addClass(self.classes.unsaved);
                            }
                        }
                        
                    });
                }
            }
        };
    };

    accountProfile.prototype.onInputChange = function (event) {
        bonzo(event.target.form).addClass(this.classes.changed);
        this.unsavedChangesForm = event.target.form;
        if (!this.unsavedFields.some(function (el) { return el === event.target; })) {
            this.unsavedFields.push(event.target);
        }
    };

    accountProfile.prototype.bindInputs = function (form) {
        var inputs = Array.prototype.slice.call(form.querySelectorAll(this.classes.textInput));
        for (var i = inputs.length - 1; i >= 0; i--) {
            inputs[i].form = form;
            inputs[i].addEventListener("keyup", this.onInputChange.bind(this));
        }
    };

    return accountProfile;

}); // define