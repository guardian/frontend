// @flow

import fastdom from 'fastdom';
import { getUserFromCookie, isUserLoggedIn } from 'common/modules/identity/api';

const updateCommentLink = (): void => {
    const commentItem = document.querySelector('.js-show-comment-activity');
    const commentLink =
        commentItem &&
        commentItem.querySelector('.js-add-comment-activity-link');

    if (commentItem && commentLink) {
        const user = getUserFromCookie();

        if (user) {
            fastdom.write(() => {
                commentItem.classList.remove('u-h');
                commentLink.setAttribute(
                    'href',
                    `https://profile.theguardian.com/user/id/${user.id}`
                );
            });
        }
    }
};

const showMyAccountIfNecessary = (): void => {
    if (!isUserLoggedIn()) {
        return;
    }

    const signIn = document.querySelector('.js-navigation-sign-in');
    const accountActions = document.querySelector(
        '.js-navigation-account-actions'
    );

    fastdom.write(() => {
        if (signIn) {
            signIn.classList.add('u-h');
        }

        if (accountActions) {
            accountActions.classList.remove('u-h');
            updateCommentLink();
        }
    });
};

export { showMyAccountIfNecessary };
