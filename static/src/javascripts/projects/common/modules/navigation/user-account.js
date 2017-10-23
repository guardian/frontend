// @flow

import fastdom from 'fastdom';
import { getUserFromCookie, isUserLoggedIn } from 'common/modules/identity/api';

const updateCommentLink = (): void => {
    fastdom
        .read(() => [...document.querySelectorAll('.js-show-comment-activity')])
        .then(commentItems => {
            const user = getUserFromCookie();

            if (user) {
                commentItems.forEach(commentItem => {
                    const commentLink = commentItem.querySelector(
                        '.js-add-comment-activity-link'
                    );

                    if (commentLink) {
                        fastdom.write(() => {
                            commentItem.classList.remove('u-h');
                            commentLink.setAttribute(
                                'href',
                                `https://profile.theguardian.com/user/id/${user.id}`
                            );
                        });
                    }
                });
            }
        });
};

const showMyAccountIfNecessary = (): void => {
    if (!isUserLoggedIn()) {
        return;
    }

    const signIns = [...document.querySelectorAll('.js-navigation-sign-in')];
    const accountActionsLists = [
        ...document.querySelectorAll('.js-navigation-account-actions'),
    ];

    fastdom
        .write(() => {
            signIns.forEach(signIn => {
                signIn.classList.add('u-h');
            });

            accountActionsLists.forEach(accountActions => {
                accountActions.classList.remove('u-h');
            });
        })
        .then(updateCommentLink);
};

export { showMyAccountIfNecessary };
