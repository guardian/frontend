import type { OphanComponent, OphanComponentType } from '@guardian/libs';
import { getUserFromCookie, isUserLoggedIn } from 'common/modules/identity/api';
import fastdom from 'lib/fastdom-promise';
import { bufferedNotificationListener } from '../bufferedNotificationListener';
import {
	submitClickEvent,
	submitInsertEvent,
	submitViewEvent,
} from '../commercial/acquisitions-ophan';
import { addTrackingToUrl } from './linkTracking';

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
): OphanComponent | undefined => {
	if (notifications.length > 0) {
		return {
			componentType: NOTIFICATION_COMPONENT_TYPE,
			id: target,
			labels: notifications.map((n) => n.ophanLabel),
		};
	}

	return undefined;
};

const trackNotificationsInsert = (ophanComponent: OphanComponent): void => {
	submitInsertEvent({ component: ophanComponent });
};

const setupTrackNotificationsClick = (
	el: Element,
	ophanComponent: OphanComponent,
): void => {
	el.addEventListener('click', () => {
		submitClickEvent({ component: ophanComponent });
	});
};

const addTrackingToLink = (
	el: Element,
	ophanComponent: OphanComponent,
): void => {
	const linkUrl = el.getAttribute('href');

	if (linkUrl) {
		const referrerUrl = window.location.origin + window.location.pathname;
		const referrerPageviewId = window.guardian.config.ophan.pageViewId;

		const urlWithTracking = addTrackingToUrl(
			linkUrl,
			ophanComponent,
			referrerUrl,
			referrerPageviewId,
		);

		el.setAttribute('href', urlWithTracking.toString());
	}
};

const setupTrackNotificationsView = (
	el: Element,
	notifications: HeaderNotification[],
	ophanComponent: OphanComponent,
): void => {
	let hasBeenSeen = false;

	if ('IntersectionObserver' in window) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (!hasBeenSeen) {
						hasBeenSeen = true;
						submitViewEvent({ component: ophanComponent });
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
					([target, notifications]) => {
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

							const messageEls = notifications.map(
								(notification) => {
									const messageEl =
										document.createElement('div');
									messageEl.classList.add(
										'dropdown-menu__notification',
									);
									messageEl.innerText = notification.message;
									return messageEl;
								},
							);
							const notificationsContainerEl =
								menuItem.querySelector(
									'.js-user-account-menu-notifications-container',
								);
							const ophanComponent =
								buildOphanComponentWithNotifications(
									target,
									notifications,
								);
							if (notificationsContainerEl && ophanComponent) {
								trackNotificationsInsert(ophanComponent);
								setupTrackNotificationsView(
									notificationsContainerEl,
									notifications,
									ophanComponent,
								);
								setupTrackNotificationsClick(
									menuItem,
									ophanComponent,
								);
								addTrackingToLink(menuItem, ophanComponent);
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

					bufferedNotificationListener.on((event) => {
						const notifications = event.detail;
						addNotifications(notifications);
					});
				});
		});
};

export { showMyAccountIfNecessary };
