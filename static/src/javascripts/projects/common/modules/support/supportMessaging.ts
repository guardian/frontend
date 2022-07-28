import { onConsentChange } from '@guardian/consent-management-platform';
import type {
	PageTracking,
	Tag,
} from '@guardian/support-dotcom-components/dist/shared/src/types/targeting';
import type React from 'react';
import { ARTICLES_VIEWED_OPT_OUT_COOKIE } from 'common/modules/commercial/user-features';
import config from 'lib/config';
import { getCookie } from 'lib/cookies';

// See https://github.com/guardian/support-dotcom-components/blob/main/module-versions.md
export const ModulesVersion = 'v3';

export const isHosted = config.get('page.isHosted');

export const supportDotcomComponentsUrl = config.get('page.isDev')
	? `https://contributions.code.dev-guardianapis.com`
	: `https://contributions.guardianapis.com`;

export const dynamicImport = async <T extends unknown>(
	url: string,
	name: string,
): Promise<React.FC<T>> => {
	const component = await window.guardianPolyfilledImport<
		Record<string, React.FC<T>>
	>(url);
	return component[name];
};

export const tracking: PageTracking = {
	ophanPageId: config.get('ophan.pageViewId') as string,
	platformId: 'GUARDIAN_WEB',
	clientName: 'frontend',
	referrerUrl: window.location.origin + window.location.pathname,
};

export const buildKeywordTags = (): Tag[] => {
	const { page } = window.guardian.config;
	const keywordIds = page.keywordIds.split(',');
	const keywords = page.keywords.split(',');
	return keywordIds.map((id, idx) => ({
		id,
		type: 'Keyword',
		title: keywords[idx],
	}));
};

type SeriesTag = {
	id: string;
	type: 'Series';
	title: string;
};
export const buildSeriesTag = (): SeriesTag => {
	const { seriesId, series } = window.guardian.config.page;
	return {
		id: seriesId,
		type: 'Series',
		title: series,
	};
};

export const buildTagIds = (): string[] => {
	const { keywordIds, toneIds, seriesId } = window.guardian.config.page;
	const keywords = keywordIds ? keywordIds.split(',') : [];
	const tones = toneIds ? toneIds.split(',') : [];
	const series = seriesId ? [seriesId] : [];
	return keywords.concat(tones).concat(series);
};

const hasOptedOutOfArticleCount = (): boolean =>
	!!getCookie(ARTICLES_VIEWED_OPT_OUT_COOKIE.name);

const DAILY_ARTICLE_COUNT_KEY = 'gu.history.dailyArticleCount';
const WEEKLY_ARTICLE_COUNT_KEY = 'gu.history.weeklyArticleCount';

const removeArticleCountsFromLocalStorage = (): void => {
	window.localStorage.removeItem(DAILY_ARTICLE_COUNT_KEY);
	window.localStorage.removeItem(WEEKLY_ARTICLE_COUNT_KEY);
};

const REQUIRED_CONSENTS_FOR_ARTICLE_COUNT = [1, 3, 7];
const REQUIRED_CONSENTS_FOR_BROWSER_ID = [1, 3, 5, 7];

export const hasCmpConsentForArticleCount = (): Promise<boolean> => {
	if (hasOptedOutOfArticleCount()) {
		return Promise.resolve(false);
	}
	return new Promise((resolve) => {
		onConsentChange(({ ccpa, tcfv2, aus }) => {
			if (ccpa || aus) {
				resolve(true);
			} else if (tcfv2) {
				const hasRequiredConsents =
					REQUIRED_CONSENTS_FOR_ARTICLE_COUNT.every(
						(consent) => tcfv2.consents[consent],
					);

				if (!hasRequiredConsents) {
					removeArticleCountsFromLocalStorage();
				}

				resolve(hasRequiredConsents);
			}
		});
	});
};

export const hasCmpConsentForBrowserId = (): Promise<boolean> =>
	new Promise((resolve) => {
		onConsentChange(({ ccpa, tcfv2, aus }) => {
			if (ccpa || aus) {
				resolve(true);
			} else if (tcfv2) {
				const hasRequiredConsents =
					REQUIRED_CONSENTS_FOR_BROWSER_ID.every(
						(consent) => tcfv2.consents[consent],
					);
				resolve(hasRequiredConsents);
			}
		});
	});
