define([
    'fastdom',
    'qwery',
    'common/modules/identity/api'
], function (
    fastdom,
    qwery,
    id
) {

    function updateCommentLink () {
        var commentLink = qwery('.js-add-comment-activity-link')[0];

        if (commentLink) {
            var user = id.getUserFromCookie();

            commentLink.removeAttribute('hidden');
            commentLink.setAttribute('href', 'https://profile.theguardian.com/user/id/' + user.id);
        }
    }

    function showMyAccountIfNecessary () {
        if(id.isUserLoggedIn()) {
            var signIn = document.querySelector('.js-navigation-sign-in');
            var accountDetails = document.querySelector('.js-navigation-account-details');

            fastdom.write(function () {
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
