import { storage } from '@guardian/libs';
import {
	getWeeklyArticleHistory,
	incrementWeeklyArticleCount,
} from '@guardian/support-dotcom-components';
import type { WeeklyArticleHistory } from '@guardian/support-dotcom-components/dist/shared/src/types/targeting';
import { storageKeyDailyArticleCount } from 'common/modules/onward/history';
import { getArticleCountConsent } from 'common/modules/support/supportMessaging';

export interface DailyArticleCount {
	day: number;
	count: number;
}

type DailyArticleHistory = DailyArticleCount[];

const today = Math.floor(Date.now() / 86400000); // 1 day in ms

const isDailyArticleHistory = (data: any): data is DailyArticleHistory =>
	Array.isArray(data);

const getDailyArticleHistory = (): DailyArticleHistory | undefined => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- reading from local storage
	const item = storage.local.get(storageKeyDailyArticleCount);
	if (isDailyArticleHistory(item)) {
		return item;
	}
	return undefined;
};

export const incrementDailyArticleCount = (): void => {
	const dailyCount = getDailyArticleHistory() ?? [];

	if (dailyCount[0]?.day === today) {
		dailyCount[0].count += 1;
	} else {
		// New day
		dailyCount.unshift({ day: today, count: 1 });

		// Remove any days older than 60
		const cutOff = today - 60;
		const firstOldDayIndex = dailyCount.findIndex(
			(c) => c.day && c.day < cutOff,
		);
		if (firstOldDayIndex > 0) {
			dailyCount.splice(firstOldDayIndex);
		}
	}

	storage.local.set(storageKeyDailyArticleCount, dailyCount);
};

export interface ArticleCounts {
	weeklyArticleHistory: WeeklyArticleHistory;
	dailyArticleHistory: DailyArticleHistory;
}

export const getArticleCounts = async (
	pageId: string,
	keywordIds: string,
	isFront: boolean,
): Promise<ArticleCounts | undefined> => {
	const hasConsentedToArticleCounts = await getArticleCountConsent();
	if (!hasConsentedToArticleCounts) return undefined;

	if (!isFront && !window.guardian.articleCounts) {
		// This is an article and the counts have not been initialised yet
		incrementWeeklyArticleCount(
			storage.local,
			pageId,
			keywordIds.split(','),
		);

		incrementDailyArticleCount();
	}

	if (!window.guardian.articleCounts) {
		const weeklyArticleHistory =
			getWeeklyArticleHistory(storage.local) ?? [];
		const dailyArticleHistory: DailyArticleHistory =
			getDailyArticleHistory() ?? [];

		window.guardian.articleCounts = {
			weeklyArticleHistory,
			dailyArticleHistory,
		};
	}

	return window.guardian.articleCounts;
};
