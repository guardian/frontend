import fakeRaven from 'raven-js';
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

describe('report-error', () => {
	const error = new Error('Something broke.');
	const tags = { test: 'testValue' };
	const ravenMetaData = { tags: tags };

	test('Does NOT throw an error', () => {
		expect(() => {
			reportError(error, tags, false);
		}).not.toThrowError(error);

		expect(fakeRaven.captureException).toHaveBeenCalledWith(
			error,
			ravenMetaData,
		);
	});

	test('Does throw an error', () => {
		expect(() => {
			reportError(error, tags);
		}).toThrowError(error);

		expect(fakeRaven.captureException).toHaveBeenCalledWith(
			error,
			ravenMetaData,
		);
	});
});
