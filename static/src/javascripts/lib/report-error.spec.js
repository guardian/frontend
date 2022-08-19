import reportError from './report-error';

jest.mock('raven-js', () => ({
	config() {
		return this;
	},
	install() {
		return this;
	},
	captureException: jest.fn(),
}));

const fakeRaven = require('raven-js');

describe('report-error', () => {
	const error = new Error('Something broke.');
	const metaData = { test: true };
	const ravenMetaData = { tags: metaData };

	test('Does not throw an error', () => {
		expect(() => {
			reportError(error, metaData, false);
		}).not.toThrowError(error);

		expect(fakeRaven.captureException).toHaveBeenCalledWith(
			error,
			ravenMetaData,
		);
	});

	test('Throws an error', () => {
		expect(() => {
			reportError(error, metaData);
		}).toThrowError(error);

		expect(fakeRaven.captureException).toHaveBeenCalledWith(
			error,
			ravenMetaData,
		);
	});
});
