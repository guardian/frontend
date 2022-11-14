import fastdom from 'lib/fastdom-promise';
import { getUserFromCookie, isUserLoggedIn } from 'common/modules/identity/api';
import { bufferedNotificationListener } from '../bufferedNotificationListener';

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
            menu: document.querySelector('#my-account-dropdown'),
        }))
        .then(els => {
            const { badge, menu } = els;

            if (notifications.length > 0 && menu) {
                const menuItem = menu.querySelector(`a[data-link-name=${id}]`)
                if (menuItem) {
                    // Add the notifications and dot to the relevant menu item(s)
                    const labelEl = document.createElement('div');
                    labelEl.innerText = 'Settings';
                    const notificationEls = notifications.map(({message}) => {
                        const el = document.createElement('div');
                        el.classList.add('dropdown-menu__notification');
                        el.innerText = message;
                        return el;
                    });
                    menuItem.innerHTML = '';
                    labelEl.classList.add('top-bar__user-account-notification-badge');
                    [labelEl, ...notificationEls].forEach(e => menuItem.appendChild(e))

                    // Show the notification badge
                    badge.classList.remove('is-hidden');
                }
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

                    let notifications = [];

                    bufferedNotificationListener.on(
                        (event) => {
                            console.log("I got a notification!", event.detail);
                            notifications = [...notifications, event.detail];
                            showNotifications(notifications);
                        },
                    );
                });
        });
};

export { showMyAccountIfNecessary };
