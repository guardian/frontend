import { storage } from '@guardian/libs';
import {
	getWeeklyArticleHistory,
	incrementWeeklyArticleCount,
} from '@guardian/support-dotcom-components';
import type { WeeklyArticleHistory } from '@guardian/support-dotcom-components/dist/shared/src/types/targeting';
import {
	getDailyArticleHistory,
	incrementDailyArticleCount,
} from 'common/modules/onward/history';
import { getArticleCountConsent } from 'common/modules/support/supportMessaging';
// TODO - migrate daily article count history code to this file (and TS)

export interface DailyArticle {
	day: number;
	count: number;
}

type DailyArticleHistory = DailyArticle[];

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
		incrementWeeklyArticleCount(
			storage.local,
			pageId,
			keywordIds.split(','),
		);

		incrementDailyArticleCount(isFront);

		const weeklyArticleHistory = getWeeklyArticleHistory(storage.local);
		const dailyArticleHistory = getDailyArticleHistory();
		window.guardian.articleCounts = {
			weeklyArticleHistory,
			dailyArticleHistory,
		};
	}

	return window.guardian.articleCounts;
};
