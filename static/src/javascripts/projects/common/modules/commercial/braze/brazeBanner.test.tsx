import { taylorReportIsLive } from 'common/modules/commercial/braze/brazeBanner';

describe('taylorReportIsLive', () => {
	it('returns true if during Taylor Report', (done) => {
		expect(taylorReportIsLive(new Date(Date.parse('2023-03-25')))).toEqual(
			true,
		);
	});
	it('returns false if before Taylor Report', (done) => {
		expect(taylorReportIsLive(new Date(Date.parse('2023-03-23')))).toEqual(
			false,
		);
	});
	it('returns false if after Taylor Report', (done) => {
		expect(taylorReportIsLive(new Date(Date.parse('2023-04-05')))).toEqual(
			false,
		);
	});
});
