import { storage } from '@guardian/libs';
import { incrementDailyArticleCount } from 'common/modules/support/articleCount';

jest.mock('raven-js', () => ({
	config() {
		return this;
	},
	install() {
		return this;
	},
	captureException: jest.fn(),
}));

const today = Math.floor(Date.now() / 86400000); // 1 day in ms

describe('articleCount', () => {
	afterEach(() => {
		storage.local.remove('gu.history.dailyArticleCount');
	});

	it('creates daily history if empty', () => {
		incrementDailyArticleCount();

		expect(storage.local.get('gu.history.dailyArticleCount')).toEqual([
			{ day: today, count: 1 },
		]);
	});

	it('removes old daily history while incrementing the article count', () => {
		const counts = [{ day: today - 70, count: 9 }];
		storage.local.set('gu.history.dailyArticleCount', counts);

		incrementDailyArticleCount();

		expect(storage.local.get('gu.history.dailyArticleCount')).toEqual([
			{ day: today, count: 1 },
		]);
	});

	it('increments the daily article count', () => {
		const counts = [
			{ day: today, count: 9 },
			{ day: today - 1, count: 2 },
		];
		storage.local.set('gu.history.dailyArticleCount', counts);

		incrementDailyArticleCount();

		expect(storage.local.get('gu.history.dailyArticleCount')).toEqual([
			{ day: today, count: 10 },
			{ day: today - 1, count: 2 },
		]);
	});
});
