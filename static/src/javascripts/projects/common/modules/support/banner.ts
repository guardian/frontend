import { mountDynamic } from '@guardian/automat-modules';
import { log } from '@guardian/libs';
import {
	getBanner,
	getPuzzlesBanner,
} from '@guardian/support-dotcom-components';
import type {
	BannerPayload,
	ModuleDataResponse,
} from '@guardian/support-dotcom-components/dist/dotcom/src/types';
import type { BannerTargeting } from '@guardian/support-dotcom-components/dist/shared/src/types/targeting';
import type React from 'react';
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import { getMvtValue } from 'common/modules/analytics/mvt-cookie';
import { submitComponentEvent } from 'common/modules/commercial/acquisitions-ophan';
import { getVisitCount } from 'common/modules/commercial/contributions-utilities';
import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';
import {
	getArticleCounts,
	getArticleCountToday,
} from 'common/modules/support/articleCount';
import {
	buildTagIds,
	dynamicImport,
	hasCmpConsentForArticleCount,
	hasCmpConsentForBrowserId,
	isHosted,
	ModulesVersion,
	supportDotcomComponentsUrl,
	tracking,
} from 'common/modules/support/supportMessaging';
import userPrefs from 'common/modules/user-prefs';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import { getCountryCode } from 'lib/geolocation';
import reportError from 'lib/report-error';

export const NO_RR_BANNER_TIMESTAMP_KEY = 'gu.noRRBannerTimestamp'; // timestamp of when we were last told not to show a RR banner
const twentyMins = 20 * 60_000;

export const withinLocalNoBannerCachePeriod = (): boolean => {
	const item = window.localStorage.getItem(NO_RR_BANNER_TIMESTAMP_KEY);
	if (item && !Number.isNaN(parseInt(item, 10))) {
		const withinCachePeriod = parseInt(item, 10) + twentyMins > Date.now();
		if (!withinCachePeriod) {
			// Expired
			window.localStorage.removeItem(NO_RR_BANNER_TIMESTAMP_KEY);
		}
		return withinCachePeriod;
	}
	return false;
};

export const setLocalNoBannerCachePeriod = (): void =>
	window.localStorage.setItem(NO_RR_BANNER_TIMESTAMP_KEY, `${Date.now()}`);

export const renderBanner = (
	response: ModuleDataResponse,
): Promise<boolean> => {
	if (!response.data) {
		return Promise.resolve(false);
	}
	const { module, meta } = response.data;

	return dynamicImport(module.url, module.name)
		.then((Banner: React.FC) => {
			const isPuzzlesBanner = module.name === 'PuzzlesBanner';

			return fastdom
				.mutate(() => {
					const container = document.createElement('div');
					container.classList.add('site-message--banner');
					container.classList.add('remote-banner');
					if (isPuzzlesBanner) {
						container.classList.add('remote-banner--puzzles');
					}

					document.body.insertAdjacentElement('beforeend', container);

					return mountDynamic(
						container,
						Banner,
						{ submitComponentEvent, ...module.props },
						!isPuzzlesBanner, // The puzzles banner has its own CacheProvider component, and needs this to be false
					);
				})
				.then(() => {
					// track banner view event in Google Analytics for subscriptions banner
					if (
						meta.componentType ===
						'ACQUISITIONS_SUBSCRIPTIONS_BANNER'
					) {
						trackNonClickInteraction(
							'subscription-banner : display',
						);
					}

					return true;
				});
		})
		.catch((error) => {
			log(
				'supporterRevenue',
				`Error importing remote banner: ${String(error)}`,
			);
			reportError(
				new Error(`Error importing remote banner: ${String(error)}`),
				{},
				false,
			);
			return false;
		});
};

const buildBannerPayload = async (): Promise<BannerPayload> => {
	const {
		contentType,
		section,
		shouldHideReaderRevenue,
		isPaidContent,
		pageId,
		keywordIds,
		isFront,
	} = window.guardian.config.page;

	const articleCounts = await getArticleCounts(pageId, keywordIds, isFront);
	const weeklyArticleHistory = articleCounts?.weeklyArticleHistory;
	const articleCountToday = getArticleCountToday(articleCounts);

	const browserId = window.guardian.config.ophan.browserId;

	const targeting: BannerTargeting = {
		alreadyVisitedCount: getVisitCount(),
		shouldHideReaderRevenue: shouldHideReaderRevenue,
		isPaidContent: isPaidContent,
		showSupportMessaging: !shouldHideSupportMessaging(),
		engagementBannerLastClosedAt:
			(userPrefs.get('engagementBannerLastClosedAt') as string) ||
			undefined,
		subscriptionBannerLastClosedAt:
			(userPrefs.get('subscriptionBannerLastClosedAt') as string) ||
			undefined,
		mvtId: getMvtValue() ?? 0,
		countryCode: getCountryCode(),
		weeklyArticleHistory: weeklyArticleHistory,
		articleCountToday: articleCountToday,
		hasOptedOutOfArticleCount: !(await hasCmpConsentForArticleCount()),
		modulesVersion: ModulesVersion,
		sectionId: section,
		tagIds: buildTagIds(),
		contentType,
		browserId: (await hasCmpConsentForBrowserId()) ? browserId : undefined,
	};

	return {
		tracking,
		targeting,
	};
};

export const fetchPuzzlesData =
	async (): Promise<ModuleDataResponse | null> => {
		const { section, series } = window.guardian.config.page;

		const payload = await buildBannerPayload();
		const isPuzzlesBannerSwitchOn = config.get<boolean>(
			'switches.puzzlesBanner',
			false,
		);
		const isPuzzlesPage = section === 'crosswords' || series === 'Sudoku';

		if (
			payload.targeting.shouldHideReaderRevenue ||
			payload.targeting.isPaidContent
		) {
			return null;
		}

		if (isPuzzlesBannerSwitchOn && isPuzzlesPage) {
			return getPuzzlesBanner(supportDotcomComponentsUrl, payload).then(
				(response: ModuleDataResponse) => {
					if (!response.data) {
						return null;
					}
					return response;
				},
			);
		}
		return null;
	};

export const fetchBannerData = async (): Promise<ModuleDataResponse | null> => {
	const payload = await buildBannerPayload();

	if (
		payload.targeting.shouldHideReaderRevenue ||
		payload.targeting.isPaidContent ||
		isHosted
	) {
		return Promise.resolve(null);
	}

	if (
		payload.targeting.engagementBannerLastClosedAt &&
		payload.targeting.subscriptionBannerLastClosedAt &&
		withinLocalNoBannerCachePeriod()
	) {
		return Promise.resolve(null);
	}

	return getBanner(supportDotcomComponentsUrl, payload).then(
		(response: ModuleDataResponse) => {
			if (!response.data) {
				if (
					payload.targeting.engagementBannerLastClosedAt &&
					payload.targeting.subscriptionBannerLastClosedAt
				) {
					setLocalNoBannerCachePeriod();
				}
				return null;
			}

			return response;
		},
	);
};
