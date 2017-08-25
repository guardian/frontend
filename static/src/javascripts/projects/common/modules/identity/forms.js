// @flow
import bean from 'bean';
import bonzo from 'bonzo';

export const forgottenEmail = (): void => {
    let hashEmail;
    let input;

    if (document.body) {
        const form = document.body.querySelector('.js-reset-form');
        if (form) {
            hashEmail = window.location.hash.match('email=([^&#]*)');
            input = form.querySelector('.js-reset-email');
            if (hashEmail && input) {
                input.value = hashEmail[1];
            }
        }
    }
};

export const forgottenPassword = (): void => {
    let email;
    let link;
    let href;

    if (document.body) {
        const form = document.body.querySelector('.js-signin-form');
        if (form) {
            email = form.querySelector('.js-signin-email');
            link = form.querySelector('.js-forgotten-password');

            if (email && link) {
                href = link.getAttribute('href');

                bean.add(link, 'click', () => {
                    const emailAddress = email.value;
                    if (emailAddress !== '') {
                        link.setAttribute(
                            'href',
                            `${href}#email=${emailAddress}`
                        );
                    }
                });
            }
        }
    }
};

export const passwordToggle = (): void => {
    let password;
    let toggleClass;
    let toggleTmpl;
    let $toggle;

    if (document.body) {
        const form = document.body.querySelector('.js-register-form');
        if (form) {
            password = form.querySelector('.js-register-password');
            toggleClass = 'js-toggle-password';
            toggleTmpl =
                `${'<div class="form-field__note form-field__note--right mobile-only">' +
                    '<a href="#toggle-password" class="'}${toggleClass}" data-password-label="Show password"` +
                ` data-text-label="Hide password" data-link-name="Toggle password field">Show password</a>` +
                `</div>`;
            $toggle = bonzo(bonzo.create(toggleTmpl)).insertBefore(password);

            $toggle.previous().addClass('form-field__note--left');

            if (password) {
                bean.add($toggle[0], `.${toggleClass}`, 'click', e => {
                    e.preventDefault();
                    const link = e.target;
                    const inputType =
                        password.getAttribute('type') === 'password'
                            ? 'text'
                            : 'password';
                    const label = link.getAttribute(`data-${inputType}-label`);
                    password.setAttribute('type', inputType);
                    bonzo(link).text(label);
                });
            }
        }
    }
};
