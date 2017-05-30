define([
    'fastdom',
    'common/modules/identity/api'
], function (
    fastdom,
    id
) {

    function updateCommentLink () {
        var commentLink = document.querySelector('.js-add-comment-activity-link');

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

            fastdom.write(function() {
                if (signIn) {
                    signIn.classList.add('u-h');
                }

                if (accountDetails) {
                    accountDetails.classList.remove('u-h');
                    updateCommentLink();
                }
            });
        }
    }

    return showMyAccountIfNecessary;
});
