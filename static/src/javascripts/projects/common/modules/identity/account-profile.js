/*
 *  Handle History updates and monitor for unsaved changes on account profile
 *  forms.
 */
import $ from 'lib/$';
import bean from 'bean';
import bonzo from 'bonzo';
import { pushUrl } from 'lib/url';
import avatarApi from 'common/modules/avatar/api';
import {
    prependSuccessMessage,
    prependErrorMessage,
} from './modules/prependMessage';

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
    tabsContainer: '.js-account-profile-tabs',
};

const messages = {
    noServerError:
        'Sorry, the Avatar upload service is currently unavailable. Please try again shortly.',
    avatarUploadSuccess:
        'Thank you for uploading your avatar. It will be checked by Guardian moderators shortly.',
    avatarUploadFailure: 'Sorry, something went wrong. Please try again.',
};

const avatarUploadByApi = (avatarForm) => {
    const form = ((document.querySelector(
        `form${classes.avatarUploadForm}`
    )));
    if (form) {
        const formData = new FormData(form);

        // disable form while submitting to prevent overlapping submissions
        const avatarUploadButton = ((document.querySelector(
            classes.avatarUploadButton
        )));
        avatarUploadButton.disabled = true;

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

                avatarUploadButton.disabled = false;
            }
        );
    }
};

class AccountProfile {
    unsavedFields;
    accountProfileForms;
    unsavedChangesForm;

    constructor() {
        this.unsavedFields = [];

        this.accountProfileForms = ((document.querySelector(
            classes.forms
        )));

        if (this.accountProfileForms) {
            this.bindAvatarUpload();

            this.bindInputs(
                this.accountProfileForms.querySelector(classes.accountForm)
            );
            this.bindInputs(
                this.accountProfileForms.querySelector(classes.publicForm)
            );

            const tabs = document.querySelector(classes.tabsContainer);

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
                if (!this.dataset.tabsIgnore) {
                    this.href = this.getAttribute('data-tabs-href');
                }
            });
            if (tabs) {
                bean.on(tabs, 'click', event => this.handleTabsClick(event));
            }
        }
    }

    /*
     *   Handle click on form tabs, change history if necessary and render error
     *   message if form contains unsaved changes.
     */
    handleTabsClick(event) {
        if (
            event.target instanceof HTMLElement &&
            event.target.nodeName.toLowerCase() === 'a'
        ) {
            const eventTarget = (event.target);
            if (eventTarget.dataset.tabsIgnore) {
                if (eventTarget.href) window.location.assign(eventTarget.href);
                event.preventDefault();
                event.stopImmediatePropagation();
            } else if (this.unsavedChangesForm) {
                // This aliasing needs to happen immediately after the null check or flow will be sad
                const form = this.unsavedChangesForm;
                event.preventDefault();
                event.stopImmediatePropagation();
                // Prevent multiple errors from appearing
                if (!form.querySelector(classes.formError)) {
                    // Append error message
                    bonzo(form).prepend(this.genUnsavedError());
                    // Bind form submit to error message 'save' action
                    bean.on(
                        form.querySelector('.js-save-unsaved'),
                        'click',
                        () => {
                            form.submit();
                        }
                    );
                }
            } else {
                const nextUrl = eventTarget.getAttribute('data-pushstate-url');
                if (nextUrl) {
                    pushUrl({}, eventTarget.innerHTML, nextUrl);
                }
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

                avatarUploadByApi(((avatarForm)));
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
            const label = this.accountProfileForms.querySelector(
                `[for="${labelId}"]`
            );
            if (label) {
                text = label.innerHTML;
                errorMessageStart += `"${text}"`;
                if (i === this.unsavedFields.length - 1) {
                    errorMessageStart += '. ';
                } else if (i === this.unsavedFields.length - 2) {
                    errorMessageStart += ' and ';
                } else {
                    errorMessageStart += ', ';
                }
            }
        }

        return errorDivStart + errorMessageStart + errorSaveLink + errorDivEnd;
    }

    /*
     *   Register a form and form field as containing unsaved changes
     */
    onInputChange(event) {
        const input = ((event.target));
        bonzo(input.form).addClass(classes.changed);
        this.unsavedChangesForm = input.form;
        if (!this.unsavedFields.some(el => el === input)) {
            this.unsavedFields.push(input);
        }
    }

    /*
     *   Bind keyup events on input fields and register parent form on element
     */
    bindInputs(form) {
        if (form instanceof HTMLFormElement) {
            const inputs = (Array.from(
                form.querySelectorAll(classes.textInput)
            ));
            inputs
                .concat(Array.from(form.querySelectorAll('select')))
                .forEach(input => {
                    if (input.type === 'select-one') {
                        input.addEventListener('change', event =>
                            this.onInputChange(event)
                        );
                    } else {
                        input.addEventListener('input', event =>
                            this.onInputChange(event)
                        );
                    }
                });
        }
    }
}

export { AccountProfile };
