import { taylorReportIsLive } from 'common/modules/commercial/braze/brazeBanner';

jest.mock('ophan/ng', () => null);
jest.mock('raven-js', () => ({
	config() {
		return this;
	},
	install() {
		return this;
	},
	captureException: jest.fn(),
}));

describe('taylorReportIsLive', () => {
	test('returns true if during Taylor Report', () => {
		const result = taylorReportIsLive(new Date(Date.parse('2023-03-25')));
		expect(result).toEqual(true);
	});
	it('returns false if before Taylor Report', () => {
		expect(taylorReportIsLive(new Date(Date.parse('2023-03-23')))).toEqual(
			false,
		);
	});
	it('returns false if after Taylor Report', () => {
		expect(taylorReportIsLive(new Date(Date.parse('2023-04-05')))).toEqual(
			false,
		);
	});
});
