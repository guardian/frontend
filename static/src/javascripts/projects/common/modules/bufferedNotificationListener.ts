window.guardian.notificationEventHistory ??= [];

const eventName = 'my_account_notification';

const bufferedNotificationListener = {
	on: (callback: (event: CustomEvent<NotificationEvent>) => void): void => {
		// See https://github.com/microsoft/TypeScript/issues/28357 for why we have to cast here
		document.addEventListener(eventName, callback as EventListener);

		if (window.guardian.notificationEventHistory) {
			window.guardian.notificationEventHistory.forEach((payload) => {
				callback(new CustomEvent(eventName, { detail: payload }));
			});
		}
	},
	emit: (payload: NotificationEvent): void => {
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
