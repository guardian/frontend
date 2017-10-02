// @flow
/* global XDomainRequest */

/*
 *  Handle History updates and monitor for unsaved changes on account profile
 *  forms.
 */
import $ from 'lib/$';
import bean from 'bean';
import bonzo from 'bonzo';
import { pushUrl } from 'lib/url';
import avatarApi from 'common/modules/avatar/api';

const classes = {
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
    memberShipContainer: '.js-memebership-tab-container',
};

const messages = {
    noServerError:
        'Sorry, the Avatar upload service is currently unavailable. Please try again shortly.',
    avatarUploadSuccess:
        'Thank you for uploading your avatar. It will be checked by Guardian moderators shortly.',
    avatarUploadFailure: 'Sorry, something went wrong. Please try again.',
};

const prependMessage = (message, location, clazz) => {
    const errorHtml = document.createElement('div');
    errorHtml.innerHTML = message;
    errorHtml.className = clazz;
    location.insertBefore(errorHtml, location.firstChild);
};

const prependErrorMessage = (message, location) => {
    const errorClass = classes.formError.replace('.', '');
    prependMessage(message, location, errorClass);
};

const prependSuccessMessage = (message, location) => {
    const errorClass = classes.formSuccess.replace('.', '');
    prependMessage(message, location, errorClass);
};

const avatarUploadByApi = avatarForm => {
    const formData = new FormData(
        document.querySelector(`form${classes.avatarUploadForm}`)
    );

    // disable form while submitting to prevent overlapping submissions
    document.querySelector(classes.avatarUploadButton).disabled = true;

    avatarApi.updateAvatar(formData).then(
        () => {
            prependSuccessMessage(messages.avatarUploadSuccess, avatarForm);
        },
        err => {
            if (err.status >= 400 && err.status < 500) {
                prependErrorMessage(
                    JSON.parse(err.responseText).message ||
                        messages.avatarUploadFailure,
                    avatarForm
                );
            } else {
                prependErrorMessage(messages.noServerError, avatarForm);
            }

            document.querySelector(classes.avatarUploadButton).disabled = false;
        }
    );
};

export class AccountProfile {
    constructor() {
        this.unsavedFields = [];
    }

    init() {
        this.accountProfileForms = document.body.querySelector(classes.forms);

        if (this.accountProfileForms) {
            this.bindAvatarUpload();

            this.bindInputs(
                this.accountProfileForms.querySelector(classes.accountForm)
            );
            this.bindInputs(
                this.accountProfileForms.querySelector(classes.publicForm)
            );

            const tabs = this.accountProfileForms.querySelector(classes.tabs);

            require.ensure(
                [],
                // webpack needs the require function to be called 'require'
                // eslint-disable-next-line no-shadow
                require => {
                    require('bootstraps/enhanced/membership').init();
                },
                'membership'
            );

            $(`${classes.tabs} .tabs__tab a`).each(function() {
                // enhance tab urls to work with JS tabs module
                this.href = this.getAttribute('data-tabs-href');
            });

            bean.on(tabs, 'click', this.handleTabsClick.bind(this));
        }
    }

    /*
     *   Handle click on form tabs, change history if necessary and render error
     *   message if form contains unsaved changes.
     */
    handleTabsClick(event) {
        if (event.target.nodeName.toLowerCase() === 'a') {
            if (this.unsavedChangesForm) {
                event.preventDefault();
                event.stopImmediatePropagation();
                // Prevent multiple errors from appearing
                if (!this.unsavedChangesForm.querySelector(classes.formError)) {
                    // Append error message
                    bonzo(this.unsavedChangesForm).prepend(
                        this.genUnsavedError()
                    );
                    // Bind form submit to error message 'save' action
                    bean.on(
                        this.unsavedChangesForm.querySelector(
                            '.js-save-unsaved'
                        ),
                        'click',
                        () => {
                            this.unsavedChangesForm.submit();
                        }
                    );
                }
            } else {
                pushUrl(
                    {},
                    event.target.innerHTML,
                    event.target.getAttribute('data-pushstate-url')
                );
            }
        }
    }

    /*
     *   Handle user avatar upload
     *   TO DO: Use html5 file api to validate file size prior to upload @chrisfinch
     */
    bindAvatarUpload() {
        const avatarForm = this.accountProfileForms.querySelector(
            classes.avatarUploadForm
        );

        if (avatarForm) {
            bean.on(avatarForm, 'submit', event => {
                event.preventDefault();

                avatarUploadByApi(avatarForm);
            });
        }
    }

    /*
     *   Generate a descriptive error message for when a user attempts to leave
     *   a form with unsaved changes.
     */
    genUnsavedError() {
        let labelId;
        let text;
        const errorDivStart = '<div class="form__error">';
        const errorDivEnd = '</div>';
        const errorSaveLink =
            '<a href="#" class="js-save-unsaved">Save changes</a>';
        let errorMessageStart = 'Your form has unsaved changes in ';

        for (let i = 0; i < this.unsavedFields.length; i += 1) {
            labelId = this.unsavedFields[i].id;
            text = this.accountProfileForms.querySelector(`[for="${labelId}"]`)
                .innerHTML;
            errorMessageStart += `"${text}"`;
            if (i === this.unsavedFields.length - 1) {
                errorMessageStart += '. ';
            } else if (i === this.unsavedFields.length - 2) {
                errorMessageStart += ' and ';
            } else {
                errorMessageStart += ', ';
            }
        }

        return errorDivStart + errorMessageStart + errorSaveLink + errorDivEnd;
    }

    /*
     *   Register a form and form field as containing unsaved changes
     */
    onInputChange(event) {
        bonzo(event.target.form).addClass(classes.changed);
        this.unsavedChangesForm = event.target.form;
        if (!this.unsavedFields.some(el => el === event.target)) {
            this.unsavedFields.push(event.target);
        }
    }

    /*
     *   Bind keyup events on input fields and register parent form on element
     */
    bindInputs(form) {
        const inputs = Array.prototype.slice.call(
            form.querySelectorAll(classes.textInput)
        );
        inputs
            .concat(Array.prototype.slice.call(form.querySelectorAll('select')))
            .forEach(input => {
                if (input.type === 'select-one') {
                    input.addEventListener(
                        'change',
                        this.onInputChange.bind(this)
                    );
                } else {
                    input.addEventListener(
                        'input',
                        this.onInputChange.bind(this)
                    );
                }
            });
    }
}
