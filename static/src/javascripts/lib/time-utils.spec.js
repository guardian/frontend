import { dateDiffDays, isExpired } from 'lib/time-utils';

describe('calculating the difference between 2 dates', () => {
	it('should return the correct duration', () => {
		const oneDayMs = 1000 * 60 * 60 * 24;

		const now = Date.now();

		expect(dateDiffDays(now, now + oneDayMs)).toBe(1);

		expect(dateDiffDays(now, now + oneDayMs - 1)).toBe(0);

		expect(dateDiffDays(now, now + 4 * oneDayMs - 1)).toBe(3);
	});
});

// TODO freeze time
describe('Determining whether or not an AB test is expired', () => {
	it('should return the correct result', () => {
		const expiredYesterdayJustBeforeMidnight =
			'Thu Nov 04 2021 23:59:59 GMT+0000 (Greenwich Mean Time)';
		expect(isExpired(expiredYesterdayJustBeforeMidnight)).toBe(true);

		const expiringTodayJustAfterMidnight =
			'Fri Nov 05 2021 00:00:01 GMT+0000 (Greenwich Mean Time)';
		expect(isExpired(expiringTodayJustAfterMidnight)).toBe(false);

		const expiringTomorrow =
			'Sat Nov 06 2021 12:00:00 GMT+0000 (Greenwich Mean Time)';
		expect(isExpired(expiringTomorrow)).toBe(false);
	});
});
