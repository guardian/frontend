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

export const dynamicImport = async (
	url: string,
	name: string,
): Promise<React.FC<any>> => {
	/* eslint-disable
			@typescript-eslint/no-unsafe-assignment,
			@typescript-eslint/no-unsafe-call,
			@typescript-eslint/no-unsafe-member-access,
			--
			dynamic import
		 */
	// @ts-expect-error -- see dynamic-import-init.js
	const component = await window.guardianPolyfilledImport(url);
	return component[name] as React.FC<any>;
	/* eslint-enable
		@typescript-eslint/no-unsafe-assignment,
		@typescript-eslint/no-unsafe-call,
		@typescript-eslint/no-unsafe-member-access,
	 */
};

export const tracking: PageTracking = {
	ophanPageId: config.get('ophan.pageViewId') as string,
	platformId: 'GUARDIAN_WEB',
	clientName: 'frontend',
	referrerUrl: window.location.origin + window.location.pathname,
};

export interface Page {
	contentType: string;
	section: string;
	shouldHideReaderRevenue: boolean;
	isPaidContent: boolean;
	isSensitive: boolean;
	keywordIds: string;
	keywords: string;
	seriesId: string;
	series: string;
	toneIds: string;
}

export const buildKeywordTags = (page: Page): Tag[] => {
	const keywordIds = page.keywordIds.split(',');
	const keywords = page.keywords.split(',');
	return keywordIds.map((id, idx) => ({
		id,
		type: 'Keyword',
		title: keywords[idx],
	}));
};
export const buildSeriesTag = (page: Page) => ({
	id: page.seriesId,
	type: 'Series',
	title: page.series,
});

export const buildTagIds = (page: Page) => {
	const { keywordIds, toneIds, seriesId } = page;
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

export const getArticleCountConsent = (): Promise<boolean> => {
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
