import bean from 'bean';
import bonzo from 'bonzo';

export function forgottenEmail(): void {
    let hashEmail;
    let input;
    const form = document.body.querySelector('.js-reset-form');
    if (form) {
        hashEmail = window.location.hash.match('email=([^&#]*)');
        if (hashEmail) {
            input = form.querySelector('.js-reset-email');
            input.value = hashEmail[1];
        }
    }
}

export function forgottenPassword(): void {
    let email;
    let link;
    let href;
    const form = document.body.querySelector('.js-signin-form');
    if (form) {
        email = form.querySelector('.js-signin-email');
        link = form.querySelector('.js-forgotten-password');
        href = link.getAttribute('href');

        bean.add(link, 'click', () => {
            const emailAddress = email.value;
            if (emailAddress !== '') {
                link.setAttribute('href', href + '#email=' + emailAddress);
            }
        });
    }
}

export function passwordToggle(): void {
    let password;
    let toggleClass;
    let toggleTmpl;
    let $toggle;
    const form = document.body.querySelector('.js-register-form');
    if (form) {
        password = form.querySelector('.js-register-password');
        toggleClass = 'js-toggle-password';
        toggleTmpl = '<div class="form-field__note form-field__note--right mobile-only">' +
            '<a href="#toggle-password" class="' + toggleClass + '" data-password-label="Show password"' +
            ' data-text-label="Hide password" data-link-name="Toggle password field">Show password</a>' +
            '</div>';
        $toggle = bonzo(bonzo.create(toggleTmpl)).insertBefore(password);

        $toggle.previous().addClass('form-field__note--left');
        bean.add($toggle[0], '.' + toggleClass, 'click', e => {
            e.preventDefault();
            const link = e.target, inputType = password.getAttribute('type') === 'password' ? 'text' : 'password', label = link.getAttribute('data-' + inputType + '-label');
            password.setAttribute('type', inputType);
            bonzo(link).text(label);
        });
    }
}
