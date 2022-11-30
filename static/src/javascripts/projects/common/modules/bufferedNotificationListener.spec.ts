import { bufferedNotificationListener } from './bufferedNotificationListener';

describe('bufferedNotificationListener', () => {
	afterEach(() => {
		window.guardian.notificationEventHistory = [];
	});

	it('calls a registered event listener when an event is emitted', (done) => {
		const callback = jest.fn(() => {
			done();
		});
		bufferedNotificationListener.on(callback);
		const notification = {
			target: 'settings',
			message: 'Your card has expired',
		};

		bufferedNotificationListener.emit(notification);

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenLastCalledWith(
			expect.objectContaining({
				detail: notification,
			}),
		);
	});

	describe('when an event listener is registered after an event', () => {
		it('replays missed events', (done) => {
			const notification = {
				target: 'settings',
				message: 'Your card has expired',
			};
			bufferedNotificationListener.emit(notification);
			const callback = jest.fn(() => {
				done();
			});

			bufferedNotificationListener.on(callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenLastCalledWith(
				expect.objectContaining({
					detail: notification,
				}),
			);
		});
	});
});
