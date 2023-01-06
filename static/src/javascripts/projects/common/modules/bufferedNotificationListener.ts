window.guardian.notificationEventHistory ??= [];

const eventName = 'my_account_notification';

/**
 * A simple event dispatcher for notifications. When a listener is added with
 * .on, any missed events will be re-played. This is needed for the header
 * notifications logic as we can't guarantee the listener will be added before
 * the first notification events are fired. Messages are buffered on the window
 * object.
 */
const bufferedNotificationListener = {
	on: (
		callback: (event: CustomEvent<HeaderNotification[]>) => void,
	): void => {
		// See https://github.com/microsoft/TypeScript/issues/28357 for why we have to cast here
		document.addEventListener(eventName, callback as EventListener);

		if (window.guardian.notificationEventHistory) {
			window.guardian.notificationEventHistory.forEach((payload) => {
				callback(new CustomEvent(eventName, { detail: payload }));
			});
		}
	},
	emit: (payload: HeaderNotification[]): void => {
		const event = new CustomEvent(eventName, {
			detail: payload,
		});

		document.dispatchEvent(event);

		// Stash this away for anyone who joins later
		window.guardian.notificationEventHistory = [
			...(window.guardian.notificationEventHistory ?? []),
			payload,
		];
	},
};

export { bufferedNotificationListener };
