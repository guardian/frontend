import type { OphanComponentType } from '@guardian/libs';
import { getUserFromCookie, isUserLoggedIn } from 'common/modules/identity/api';
import fastdom from 'lib/fastdom-promise';
import { bufferedNotificationListener } from '../bufferedNotificationListener';
import {
	submitInsertEvent,
	submitViewEvent,
} from '../commercial/acquisitions-ophan';

const NOTIFICATION_COMPONENT_TYPE: OphanComponentType = 'RETENTION_HEADER';

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

const buildOphanComponentWithNotifications = (
	target: string,
	notifications: HeaderNotification[],
) => {
	if (notifications.length > 0) {
		return {
			component: {
				componentType: NOTIFICATION_COMPONENT_TYPE,
				id: target,
				labels: notifications.map((n) => n.ophanLabel),
			},
		};
	}

	return undefined;
};

const trackNotificationsInsert = (
	target: string,
	notifications: HeaderNotification[],
): void => {
	const ophanComponent = buildOphanComponentWithNotifications(
		target,
		notifications,
	);
	if (ophanComponent) {
		submitInsertEvent(ophanComponent);
	}
};

const setupTrackNotificationsView = (
	el: Element,
	target: string,
	notifications: HeaderNotification[],
): void => {
	let hasBeenSeen = false;

	if ('IntersectionObserver' in window) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (!hasBeenSeen) {
						hasBeenSeen = true;
						// Track impression
						const ophanComponent = buildOphanComponentWithNotifications(
							target,
							notifications,
						);
						if (ophanComponent) {
							submitViewEvent(ophanComponent);
						}
						notifications.forEach((n) => n.logImpression());
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
	notifications: HeaderNotification[],
): Record<string, HeaderNotification[]> => {
	const notificationsMap: Record<string, HeaderNotification[]> = {};
	notifications.forEach((notification) => {
		if (Array.isArray(notificationsMap[notification.target])) {
			notificationsMap[notification.target].push(notification);
		} else {
			notificationsMap[notification.target] = [notification];
		}
	});
	return notificationsMap;
};

const addNotifications = (notifications: HeaderNotification[]): void => {
	void fastdom
		.measure(() => ({
			badge: document.querySelector('.js-user-account-notification-badge'),
			menu: document.querySelector('#my-account-dropdown'),
		}))
		.then((els) => {
			const { badge, menu } = els;

			if (notifications.length > 0 && badge && menu) {
				// Show the notification badge
				badge.classList.remove('is-hidden');

				// Add messages to the relevant menu item(s)
				const groupedNotifications = groupNotificationsByTarget(notifications);

				Object.entries(groupedNotifications).map(([target, notifications]) => {
					const menuItem = menu.querySelector(`a[data-link-id=${target}]`);
					if (menuItem) {
						const labelEl = menuItem.querySelector(
							'.js-user-account-menu-label',
						);
						labelEl?.classList.add('top-bar__user-account-notification-badge');

						const messageEls = notifications.map((notification) => {
							const messageEl = document.createElement('div');
							messageEl.classList.add('dropdown-menu__notification');
							messageEl.innerText = notification.message;
							return messageEl;
						});
						const notificationsContainerEl = menuItem.querySelector(
							'.js-user-account-menu-notifications-container',
						);
						if (notificationsContainerEl) {
							trackNotificationsInsert(target, notifications);
							setupTrackNotificationsView(
								notificationsContainerEl,
								target,
								notifications,
							);
							notificationsContainerEl.append(...messageEls);
						}
					}
				});
			}
		});
};

const showMyAccountIfNecessary = (): void => {
	if (!isUserLoggedIn()) {
		return;
	}

	void fastdom
		.measure(() => ({
			signIns: Array.from(document.querySelectorAll('.js-navigation-sign-in')),
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

					bufferedNotificationListener.on((event) => {
						const notifications = event.detail;
						addNotifications(notifications);
					});
				});
		});
};

export { showMyAccountIfNecessary };
