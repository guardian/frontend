// @flow

import fastdom from 'fastdom';
import { getUserFromCookie, isUserLoggedIn } from 'common/modules/identity/api';
import avatarAPI from 'common/modules/avatar/api';

const updateCommentLink = (): void => {
    const commentItem = document.querySelector('.js-show-comment-activity');
    const commentLink =
        commentItem &&
        commentItem.querySelector('.js-add-comment-activity-link');

    if (commentItem && commentLink) {
        const user = getUserFromCookie();

        fastdom.write(() => {
            commentItem.classList.remove('u-h');
            commentLink.setAttribute(
                'href',
                `https://profile.theguardian.com/user/id/${user.id}`
            );
        });
    }
};

const enhanceAvatar = (): Promise<void> => {
    const fallbackEl = document.querySelector(
        '.js-navigation-account-avatar-fallback'
    );
    const avatarEl = document.querySelector('.js-navigation-account-avatar');

    const preloadAvatar = (src: string): Promise<void> => {
        const image = new Image();
        image.src = src;

        return new Promise(resolve => {
            image.onload = resolve;
        });
    };

    const swapFallback = (
        fallback: HTMLElement,
        avatar: HTMLElement,
        src: string
    ) => {
        fastdom.write(() => {
            if (fallback) {
                fallback.classList.add('u-h');
            }

            if (avatar) {
                avatar.setAttribute('src', src);
                avatar.classList.remove('u-h');
            }
        });
    };

    if (!isUserLoggedIn() || !avatarEl) {
        return Promise.resolve();
    }

    return avatarAPI.getActive().then(res => {
        const src = res && res.data && res.data.avatarUrl;

        if (src) {
            preloadAvatar(src).then(() =>
                swapFallback(fallbackEl, avatarEl, src)
            );
        }
    });
};

const showMyAccountIfNecessary = (): void => {
    if (!isUserLoggedIn()) {
        return;
    }

    const signIn = document.querySelector('.js-navigation-sign-in');
    const accountDetails = document.querySelector(
        '.js-navigation-account-details'
    );
    const accountActions = document.querySelector(
        '.js-navigation-account-actions'
    );
    const user = getUserFromCookie();
    const userNameEl = document.querySelector(
        '.js-navigation-account-username'
    );

    fastdom.write(() => {
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
};

export { showMyAccountIfNecessary, enhanceAvatar };
