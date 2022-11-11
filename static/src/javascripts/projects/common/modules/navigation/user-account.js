import fastdom from 'lib/fastdom-promise';
import { getUserFromCookie, isUserLoggedIn } from 'common/modules/identity/api';

const updateCommentLink = (commentItems) => {
    const user = getUserFromCookie();

    if (user) {
        commentItems.forEach(commentItem => {
            fastdom
                .measure(() =>
                    commentItem.querySelector('.js-add-comment-activity-link')
                )
                .then(commentLink =>
                    fastdom.mutate(() => {
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

const showNotifications = (notifications) => {
    fastdom
        .measure(() => ({
            badge: document.querySelector('.js-user-account-notification-badge'),
            menuItem: document.querySelector('.js-user-account-dropdown-menu-settings-item'),
        }))
        .then(els => {
            const { badge, menuItem } = els;

            if (notifications.length > 0 && menuItem) {
                // Show the notification badge
                badge.classList.remove('is-hidden');

                // Add the notifications and dot to the 'Settings' menu item
                const labelEl = document.createElement('div');
                labelEl.innerText = 'Settings';
                const notificationEls = notifications.map(notification => {
                    const el = document.createElement('div');
                    el.classList.add('dropdown-menu__notification');
                    el.innerText = notification;
                    return el;
                });
                menuItem.innerHTML = '';
                labelEl.classList.add('top-bar__user-account-notification-badge');
                [labelEl, ...notificationEls].forEach(e => menuItem.appendChild(e))
            }
        });
};

const showMyAccountIfNecessary = () => {
    if (!isUserLoggedIn()) {
        // return;
    }

    fastdom
        .measure(() => ({
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
                .mutate(() => {
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

                    const notifications = ['Your credit card has expired.'];    // TODO get from braze
                    if (notifications.length > 0) {
                        showNotifications(notifications);
                    }
                });
        });
};

export { showMyAccountIfNecessary };
