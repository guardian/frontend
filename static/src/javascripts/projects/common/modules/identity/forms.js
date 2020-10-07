// @flow
import bean from 'bean';
import { $ } from 'lib/$';

export const forgottenEmail = (): void => {
    let hashEmail;
    let input;

    if (document.body) {
        const form = document.body.querySelector('.js-reset-form');
        if (form) {
            hashEmail = window.location.hash.match('email=([^&#]*)');
            input = form.querySelector('.js-reset-email');
            if (hashEmail && input && input instanceof HTMLInputElement) {
                input.value = hashEmail[1];
            }
        }
    }
};

export const passwordToggle = (): void => {
    if (document.body) {
        const form = document.body.querySelector('.js-register-form');
        if (form) {
            const password = form.querySelector('.js-register-password');
            const toggleClass = 'js-toggle-password';
            const toggleTmpl = `<div class="form-field__note form-field__note--right mobile-only">
                    <a href="#toggle-password" class="'${toggleClass}" data-password-label="Show password"
                    data-text-label="Hide password" data-link-name="Toggle password field">Show password</a>
                </div>`;
            const $toggle = $($.create(toggleTmpl)).insertBefore(
                password
            );

            $toggle.previous().addClass('form-field__note--left');

            bean.add($toggle[0], `.${toggleClass}`, 'click', e => {
                e.preventDefault();
                const link = e.target;
                const inputType =
                    password && password.getAttribute('type') === 'password'
                        ? 'text'
                        : 'password';
                const label = link.getAttribute(`data-${inputType}-label`);
                if (password) {
                    password.setAttribute('type', inputType);
                }
                $(link).text(label);
            });
        }
    }
};
