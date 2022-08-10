import reportError, { isInSample } from './report-error';

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

	test('Throws an error if sample rate is GREATER than random number', () => {
		jest.spyOn(global.Math, 'random').mockReturnValue(0.2);
		expect(() => {
			reportError(error, metaData, true, 0.5);
		}).toThrowError(error);
	});

	test('Does not throw an error if sample rate is LESS than random number', () => {
		jest.spyOn(global.Math, 'random').mockReturnValue(0.8);
		expect(() => {
			reportError(error, metaData, true, 0.5);
		}).not.toThrowError(error);
	});

	describe('isInSample', () => {
		it.each([0, 0.5, 0.99])(
			'returns true if sample rate is 1',
			(randomNumber) => {
				jest.spyOn(global.Math, 'random').mockReturnValue(randomNumber);

				expect(isInSample(1)).toBe(true);
			},
		);

		test('returns TRUE if sample rate is GREATER than random number', () => {
			const sampleRate = 0.1;
			jest.spyOn(global.Math, 'random').mockReturnValue(0.08);

			expect(isInSample(sampleRate)).toBe(true);
		});

		test('returns FALSE if sample rate is LESS than random number', () => {
			const sampleRate = 0.1;
			jest.spyOn(global.Math, 'random').mockReturnValue(0.18);

			expect(isInSample(sampleRate)).toBe(false);
		});
	});
});
