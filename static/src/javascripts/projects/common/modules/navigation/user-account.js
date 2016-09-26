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
            var userAccountLinksContainer = qwery('.js-show-user-account-links')[0];

            if (userAccountLinksContainer) {
                fastdom.write(function () {
                    userAccountLinksContainer.classList.add('user-signed-in');

                    updateCommentLink();
                });
            }
        }
    }


    return showMyAccountIfNecessary;
});
