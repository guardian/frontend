import { mountDynamic } from '@guardian/automat-modules';
import { log, storage } from '@guardian/libs';
import {
	getEpic,
	getEpicViewLog,
	getLiveblogEpic,
	getWeeklyArticleHistory,
} from '@guardian/support-dotcom-components';
import type {
	EpicPayload,
	ModuleData,
	ModuleDataResponse,
} from '@guardian/support-dotcom-components/dist/dotcom/src/types';
import type { EpicTargeting } from '@guardian/support-dotcom-components/dist/shared/src/types/targeting';
import { getMvtValue } from 'common/modules/analytics/mvt-cookie';
import { submitComponentEvent } from 'common/modules/commercial/acquisitions-ophan';
import { setupRemoteEpicInLiveblog } from 'common/modules/commercial/contributions-liveblog-utilities';
import {
	getLastOneOffContributionTimestamp,
	isRecurringContributor,
	shouldHideSupportMessaging,
} from 'common/modules/commercial/user-features';
import {
	buildKeywordTags,
	buildSeriesTag,
	dynamicImport,
	getArticleCountConsent,
	isHosted,
	ModulesVersion,
	supportDotcomComponentsUrl,
	tracking,
} from 'common/modules/support/supportMessaging';
import config from 'lib/config';
import { getCountryCode } from 'lib/geolocation';
import reportError from 'lib/report-error';

const getEpicElement = (): HTMLDivElement => {
	const target = document.querySelector('.submeta');
	if (!target) {
		throw new Error('Could not find target element for Epic');
	}

	const parent = target.parentNode;
	if (!parent) {
		throw new Error('Could not find parent element for Epic');
	}

	const container = document.createElement('div');
	parent.insertBefore(container, target);

	return container;
};

const buildEpicPayload = async (): Promise<EpicPayload> => {
	const { contentType, section, shouldHideReaderRevenue, isPaidContent } =
		window.guardian.config.page;

	const countryCode = getCountryCode();

	const targeting: EpicTargeting = {
		contentType: contentType,
		sectionId: section,
		shouldHideReaderRevenue: shouldHideReaderRevenue ?? false,
		isMinuteArticle: config.hasTone('Minute'),
		isPaidContent: isPaidContent,
		tags: buildKeywordTags().concat([buildSeriesTag()]),
		showSupportMessaging: !shouldHideSupportMessaging(),
		isRecurringContributor: isRecurringContributor(),
		lastOneOffContributionDate:
			getLastOneOffContributionTimestamp() ?? undefined,
		mvtId: getMvtValue() ?? 0,
		countryCode,
		epicViewLog: getEpicViewLog(storage.local),
		weeklyArticleHistory: getWeeklyArticleHistory(storage.local),
		hasOptedOutOfArticleCount: !(await getArticleCountConsent()),
		modulesVersion: ModulesVersion,
		url: window.location.origin + window.location.pathname,
	};

	return {
		tracking,
		targeting,
	};
};

const renderLiveblogEpic = async (module: ModuleData): Promise<void> => {
	const Epic = await dynamicImport(module.url, module.name);

	setupRemoteEpicInLiveblog(Epic, {
		submitComponentEvent,
		...module.props,
	});
};

const renderEpic = async (module: ModuleData): Promise<void> => {
	const Epic = await dynamicImport(module.url, module.name);

	const el = getEpicElement();
	mountDynamic(el, Epic, { submitComponentEvent, ...module.props }, true);
};

export const fetchAndRenderEpic = (): Promise<void> => {
	const { contentType } = window.guardian.config.page;
	const isSupportedContentType =
		contentType === 'Article' || contentType === 'LiveBlog';

	if (!isSupportedContentType || isHosted) {
		return Promise.resolve();
	}

	const fetchEpic = (payload: EpicPayload): Promise<ModuleDataResponse> =>
		contentType === 'LiveBlog'
			? getLiveblogEpic(supportDotcomComponentsUrl, payload)
			: getEpic(supportDotcomComponentsUrl, payload);

	const render = (response: ModuleDataResponse): Promise<void> => {
		if (response.data) {
			const { module } = response.data;

			if (contentType === 'Article') {
				return renderEpic(module);
			} else {
				return renderLiveblogEpic(module);
			}
		}
		return Promise.resolve(); // nothing to render
	};

	return buildEpicPayload()
		.then(fetchEpic)
		.then(render)
		.catch((error) => {
			/* eslint-disable @typescript-eslint/restrict-template-expressions -- error log */
			log('supporterRevenue', `Error importing remote epic: ${error}`);
			reportError(
				new Error(`Error importing remote epic: ${error}`),
				{},
				false,
			);
			/* eslint-enable @typescript-eslint/restrict-template-expressions */
		});
};
