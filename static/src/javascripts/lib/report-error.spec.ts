import { reportError } from './report-error';

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
	const tags = { test: 'testValue' };
	const ravenMetaData = { tags: tags };

	test('Does not throw an error', () => {
		expect(() => {
			reportError(error, tags, false);
		}).not.toThrowError(error);

		expect(fakeRaven.captureException).toHaveBeenCalledWith(
			error,
			ravenMetaData,
		);
	});

	test('Throws an error', () => {
		expect(() => {
			reportError(error, tags);
		}).toThrowError(error);

		expect(fakeRaven.captureException).toHaveBeenCalledWith(
			error,
			ravenMetaData,
		);
	});
});
