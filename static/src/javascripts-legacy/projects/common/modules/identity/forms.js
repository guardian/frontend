define(['bean', 'bonzo'], function(bean, bonzo) {
    function forgottenEmail() {
        var hashEmail,
            input,
            form = document.body.querySelector('.js-reset-form');
        if (form) {
            hashEmail = window.location.hash.match('email=([^&#]*)');
            if (hashEmail) {
                input = form.querySelector('.js-reset-email');
                input.value = hashEmail[1];
            }
        }
    }

    function forgottenPassword() {
        var email,
            link,
            href,
            form = document.body.querySelector('.js-signin-form');
        if (form) {
            email = form.querySelector('.js-signin-email');
            link = form.querySelector('.js-forgotten-password');
            href = link.getAttribute('href');

            bean.add(link, 'click', function() {
                var emailAddress = email.value;
                if (emailAddress !== '') {
                    link.setAttribute('href', href + '#email=' + emailAddress);
                }
            });
        }
    }

    function passwordToggle() {
        var password,
            toggleClass,
            toggleTmpl,
            $toggle,
            form = document.body.querySelector('.js-register-form');
        if (form) {
            password = form.querySelector('.js-register-password');
            toggleClass = 'js-toggle-password';
            toggleTmpl =
                '<div class="form-field__note form-field__note--right mobile-only">' +
                '<a href="#toggle-password" class="' +
                toggleClass +
                '" data-password-label="Show password"' +
                ' data-text-label="Hide password" data-link-name="Toggle password field">Show password</a>' +
                '</div>';
            $toggle = bonzo(bonzo.create(toggleTmpl)).insertBefore(password);

            $toggle.previous().addClass('form-field__note--left');
            bean.add($toggle[0], '.' + toggleClass, 'click', function(e) {
                e.preventDefault();
                var link = e.target,
                    inputType = password.getAttribute('type') === 'password'
                        ? 'text'
                        : 'password',
                    label = link.getAttribute('data-' + inputType + '-label');
                password.setAttribute('type', inputType);
                bonzo(link).text(label);
            });
        }
    }

    return {
        forgottenEmail: forgottenEmail,
        forgottenPassword: forgottenPassword,
        passwordToggle: passwordToggle,
    };
});
