import { shouldRefreshCookie } from './cookierefresh';

jest.mock('lib/raven');

const now = new Date().getTime();

test('should return true for a user who has never refreshed cookies', () => {
	expect(shouldRefreshCookie(null, now)).toBe(true);
});

test('should return true for 0 or a value which cannot be parsed as a number', () => {
	expect(shouldRefreshCookie('notANumber', now)).toBe(true);
	expect(shouldRefreshCookie(undefined, now)).toBe(true);
	expect(shouldRefreshCookie(false, now)).toBe(true);
	expect(shouldRefreshCookie(0, now)).toBe(true);
});

test('should return true for a user who has not refreshed within 30 days', () => {
	const daysAgo31 = new Date().getTime() - 1000 * 86400 * 31;
	expect(shouldRefreshCookie(daysAgo31, now)).toBe(true);
});

test('should return false for a user who has refreshed within 30 days', () => {
	const daysAgo5 = new Date().getTime() - 1000 * 86400 * 5;
	expect(shouldRefreshCookie(daysAgo5, now)).toBe(false);
});
