// @flow
import fastdom from 'lib/fastdom-promise';
import { getUserFromCookie, isUserLoggedIn } from 'common/modules/identity/api';

const updateCommentLink = (commentItems): void => {
    const user = getUserFromCookie();

    if (user) {
        commentItems.forEach(commentItem => {
            fastdom
                .read(() =>
                    commentItem.querySelector('.js-add-comment-activity-link')
                )
                .then(commentLink =>
                    fastdom.write(() => {
                        commentItem.classList.remove('u-h');
                        commentLink.setAttribute(
                            'href',
                            `https://profile.theguardian.com/user/id/${user.id}`
                        );
                    })
                );
        });
    }
};

const showMyAccountIfNecessary = (): void => {
    if (!isUserLoggedIn()) {
        return;
    }

    fastdom
        .read(() => ({
            signIns: Array.from(
                document.querySelectorAll('.js-navigation-sign-in')
            ),
            accountActionsLists: Array.from(
                document.querySelectorAll('.js-navigation-account-actions')
            ),
            commentItems: Array.from(
                document.querySelectorAll('.js-show-comment-activity')
            ),
        }))
        .then(els => {
            const { signIns, accountActionsLists, commentItems } = els;
            return fastdom
                .write(() => {
                    signIns.forEach(signIn => {
                        signIn.remove();
                    });
                    accountActionsLists.forEach(accountActions => {
                        accountActions.classList.remove('is-hidden');
                    });

                    Array.from(
                        document.querySelectorAll('.js-user-account-trigger')
                    ).forEach(accountTrigger => {
                        accountTrigger.classList.remove('is-hidden');
                    });
                })
                .then(() => {
                    updateCommentLink(commentItems);
                });
        });
};

export { showMyAccountIfNecessary };
