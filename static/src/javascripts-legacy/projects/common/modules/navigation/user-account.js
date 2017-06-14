define([
    'fastdom',
    'common/modules/identity/api',
    'lib/config',
], function (
    fastdom,
    id,
    config
) {

    function updateCommentLink () {
        var commentLink = document.querySelector('.js-add-comment-activity');

        if (commentLink) {
            var user = id.getUserFromCookie();

            fastdom.write(function() {
                commentLink.classList.remove('u-h');
                commentLink.setAttribute('href', 'https://profile.theguardian.com/user/id/' + user.id);
            });
        }
    }

    function showMyAccountIfNecessary () {
        if(id.isUserLoggedIn()) {
            var signIn = document.querySelector('.js-navigation-sign-in');
            var accountDetails = document.querySelector('.js-navigation-account-details');
            var accountActions = document.querySelector('.js-navigation-account-actions');
            var user = config.user;
            var userNameEl = document.querySelector('.js-navigation-account-username');

            fastdom.write(function() {
                if (signIn) {
                    signIn.classList.add('u-h');
                }

                if (accountDetails) {
                    accountDetails.classList.remove('u-h');
                }

                if (accountActions) {
                    accountActions.classList.remove('u-h');
                    updateCommentLink();
                }

                if (userNameEl && user && user.displayName) {
                    userNameEl.innerText = user.displayName;
                }
            });
        }
    }

    return showMyAccountIfNecessary;
});
