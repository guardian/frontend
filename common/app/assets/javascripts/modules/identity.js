define(['bean'], function (bean) {

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

            bean.on(link, 'click', function(e) {
                var emailAddress = email.value;
                if (emailAddress !== '') {
                    link.setAttribute('href', href + '#email=' + emailAddress);
                }
            });
        }
    }

    return {
        forgottenEmail: forgottenEmail,
        forgottenPassword: forgottenPassword
    };
});