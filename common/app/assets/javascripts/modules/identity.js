define(['bean', 'bonzo', 'ajax'], function (bean, bonzo, ajax) {

    function forgottenEmail(config, context) {
        var form = context.querySelector('.js-reset-form');
        if (form) {
            var hashEmail = window.location.hash.match('email=([^&#]*)');
            if (hashEmail) {
                var input = form.querySelector('.js-reset-email');
                input.value = hashEmail[1];
            }
        }
    }

    function forgottenPassword(config, context) {
        var form = context.querySelector('.js-signin-form');
        if (form) {
            var email = form.querySelector('.js-signin-email'),
                link = form.querySelector('.js-forgotten-password'),
                href = link.getAttribute('href');

            bean.add(link, 'click', function(e) {
                var emailAddress = email.value;
                if (emailAddress !== '') {
                    link.setAttribute('href', href + '#email=' + emailAddress);
                }
            });
        }
    }

    function passwordToggle(config, context) {
        var form = context.querySelector('.js-register-form');
        if (form) {
            var password = form.querySelector('.js-register-password'),
                toggleClass = 'js-toggle-password',
                toggleTmpl = '<div class="form-field__note form-field__note--right mobile-only">' +
                                '<a href="#toggle-password" class="' + toggleClass + '" data-password-label="Show password"' +
                                ' data-text-label="Hide password" data-link-name="Toggle password field">Show password</a>' +
                             '</div>',
                $toggle = bonzo(bonzo.create(toggleTmpl)).insertBefore(password);

            $toggle.previous().addClass('form-field__note--left');
            bean.add($toggle[0], '.' + toggleClass, 'click', function(e) {
                e.preventDefault();
                var link = e.target,
                    inputType = password.getAttribute('type') === 'password' ? 'text' : 'password',
                    label = link.getAttribute('data-' + inputType + '-label');
                password.setAttribute('type', inputType);
                bonzo(link).text(label);
            });
        }
    }

    function usernameAvailable(config, context) {
        var form = context.querySelector('.js-register-form');
        if (form) {
            var username = form.querySelector('.js-register-username'),
                availableTmpl = '<div class="form-field__note form-field__note--right registration-username-check h">Enter username</div>',
                $available = bonzo(bonzo.create(availableTmpl)).insertBefore(username);

            $available.previous().addClass('form-field__note--left');
            bean.on(username, 'blur', function(e) {
                if (username.value.length < 6) {
                    $available.text("Username too short");
                } else if (username.value.length > 20) {
                    $available.text("Username too long");
                } else {
                    $available.removeClass('h').text("Checking username");
                    ajax({
                        url: config.page.idApiUrl + '/user/is-username-valid-or-taken',
                        type: 'jsonp',
                        data: {
                            accessToken: config.page.idApiJsClientToken,
                            username: username.value
                        },
                        crossOrigin: true,
                        success: function(response) {
                            if (response.status === "ok") {
                                $available.html('<span class="available">Username available</span>');
                            } else {
                                $available.html('<span class="unavailable">Username unavailable</span>');
                            }
                        }
                    });
                }
            });
        }
    }

    return {
        forgottenEmail: forgottenEmail,
        forgottenPassword: forgottenPassword,
        passwordToggle: passwordToggle,
        usernameAvailable: usernameAvailable
    };
});
