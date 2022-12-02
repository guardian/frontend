import { getUserFromCookie, isUserLoggedIn } from 'common/modules/identity/api';
import fastdom from 'lib/fastdom-promise';
import { bufferedNotificationListener } from '../bufferedNotificationListener';

const updateCommentLink = (commentItems: Element[]): void => {
	const user = getUserFromCookie();

	if (user) {
		commentItems.forEach((commentItem) => {
			void fastdom
				.measure(() =>
					commentItem.querySelector('.js-add-comment-activity-link'),
				)
				.then((commentLink) => {
					if (commentLink) {
						void fastdom.mutate(() => {
							commentItem.classList.remove('u-h');
							commentLink.setAttribute(
								'href',
								`https://profile.theguardian.com/user/id/${user.id}`,
							);
						});
					}
				});
		});
	}
};

const trackFirstImpression = (el: HTMLElement): void => {
	let hasBeenSeen = false;

	if ('IntersectionObserver' in window) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (!hasBeenSeen) {
						hasBeenSeen = true;
						// Track impression
					}
				}
			},
			{
				threshold: 1.0,
			},
		);
		observer.observe(el);
	}
};

const groupNotificationsByTarget = (
	notifications: NotificationEvent[],
): Record<string, string[]> => {
	const notificationsMap: Record<string, string[]> = {};
	notifications.forEach(({ message, target }) => {
		if (Array.isArray(notificationsMap[target])) {
			notificationsMap[target].push(message);
		} else {
			notificationsMap[target] = [message];
		}
	});
	return notificationsMap;
};

const addNotifications = (notifications: NotificationEvent[]): void => {
	void fastdom
		.measure(() => ({
			badge: document.querySelector(
				'.js-user-account-notification-badge',
			),
			menu: document.querySelector('#my-account-dropdown'),
		}))
		.then((els) => {
			const { badge, menu } = els;

			if (notifications.length > 0 && badge && menu) {
				// Show the notification badge
				badge.classList.remove('is-hidden');

				// Add messages to the relevant menu item(s)
				const groupedNotifications =
					groupNotificationsByTarget(notifications);

				Object.entries(groupedNotifications).map(
					([target, messages]) => {
						const menuItem = menu.querySelector(
							`a[data-link-id=${target}]`,
						);
						if (menuItem) {
							const labelEl = menuItem.querySelector(
								'.js-user-account-menu-label',
							);
							labelEl?.classList.add(
								'top-bar__user-account-notification-badge',
							);

							const messageEls = messages.map((message) => {
								const messageEl = document.createElement('div');
								messageEl.classList.add(
									'dropdown-menu__notification',
								);
								messageEl.innerText = message;
								trackFirstImpression(messageEl);
								return messageEl;
							});
							const notificationsContainerEl =
								menuItem.querySelector(
									'.js-user-account-menu-notifications-container',
								);
							if (notificationsContainerEl) {
								notificationsContainerEl.append(...messageEls);
							}
						}
					},
				);
			}
		});
};

const showMyAccountIfNecessary = (): void => {
	if (!isUserLoggedIn()) {
		return;
	}

	void fastdom
		.measure(() => ({
			signIns: Array.from(
				document.querySelectorAll('.js-navigation-sign-in'),
			),
			accountActionsLists: Array.from(
				document.querySelectorAll('.js-navigation-account-actions'),
			),
			commentItems: Array.from(
				document.querySelectorAll('.js-show-comment-activity'),
			),
		}))
		.then((els) => {
			const { signIns, accountActionsLists, commentItems } = els;
			return fastdom
				.mutate(() => {
					signIns.forEach((signIn) => {
						signIn.remove();
					});
					accountActionsLists.forEach((accountActions) => {
						accountActions.classList.remove('is-hidden');
					});

					Array.from(
						document.querySelectorAll('.js-user-account-trigger'),
					).forEach((accountTrigger) => {
						accountTrigger.classList.remove('is-hidden');
					});
				})
				.then(() => {
					updateCommentLink(commentItems);

					let notifications: NotificationEvent[] = [];

					bufferedNotificationListener.on((event) => {
						notifications = [event.detail];
						addNotifications(notifications);
					});
				});
		});
};

export { showMyAccountIfNecessary };
