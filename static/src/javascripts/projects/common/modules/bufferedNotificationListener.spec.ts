import { bufferedNotificationListener } from './bufferedNotificationListener';

// eslint-disable-next-line @typescript-eslint/no-empty-function -- no-op
const noOp = () => {};

describe('bufferedNotificationListener', () => {
	afterEach(() => {
		window.guardian.notificationEventHistory = [];
	});

	it('calls a registered event listener when an event is emitted', (done) => {
		const callback = jest.fn(() => {
			done();
		});
		bufferedNotificationListener.on(callback);
		const notifications = [
			{
				id: '1234abcde',
				target: 'settings',
				message: 'Your card has expired',
				ophanLabel: 'settings-label',
				logImpression: noOp,
				logClick: noOp,
			},
		];

		bufferedNotificationListener.emit(notifications);

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenLastCalledWith(
			expect.objectContaining({
				detail: notifications,
			}),
		);
	});

	describe('when an event listener is registered after an event', () => {
		it('replays missed events', (done) => {
			const notifications = [
				{
					id: '1234abcde',
					target: 'settings',
					message: 'Your card has expired',
					ophanLabel: 'settings-label',
					logImpression: noOp,
					logClick: noOp,
				},
			];
			bufferedNotificationListener.emit(notifications);
			const callback = jest.fn(() => {
				done();
			});

			bufferedNotificationListener.on(callback);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenLastCalledWith(
				expect.objectContaining({
					detail: notifications,
				}),
			);
		});
	});
});
