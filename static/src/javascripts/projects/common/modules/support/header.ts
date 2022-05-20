import { mountDynamic } from '@guardian/automat-modules';
import { log } from '@guardian/libs';
import { getHeader } from '@guardian/support-dotcom-components';
import type { HeaderPayload } from '@guardian/support-dotcom-components/dist/dotcom/src/types';
import { getMvtValue } from 'common/modules/analytics/mvt-cookie';
import { submitComponentEvent } from 'common/modules/commercial/acquisitions-ophan';
import {
	getLastOneOffContributionDate,
	getPurchaseInfo,
	shouldHideSupportMessaging,
} from 'common/modules/commercial/user-features';
import { isUserLoggedIn } from 'common/modules/identity/api';
import {
	dynamicImport,
	ModulesVersion,
	supportDotcomComponentsUrl,
	tracking,
} from 'common/modules/support/supportMessaging';
import config from 'lib/config';
import { getCountryCode } from 'lib/geolocation';
import reportError from 'lib/report-error';

const buildHeaderLinksPayload = (): HeaderPayload => {
	const countryCode = getCountryCode();
	const edition = config.get('page.edition', 'INT');
	return {
		tracking,
		targeting: {
			showSupportMessaging: !shouldHideSupportMessaging(),
			edition,
			countryCode,
			modulesVersion: ModulesVersion,
			mvtId: getMvtValue() ?? 0,
			lastOneOffContributionDate:
				getLastOneOffContributionDate() ?? undefined,
			// TODO: remove this once PR in support-dotcom-components is merged and released
			// https://github.com/guardian/support-dotcom-components/pull/665
			// eslint-disable-next-line -- see above
			// @ts-ignore
			// eslint-disable-next-line -- see above
			purchaseInfo: getPurchaseInfo(),
			isSignedIn: isUserLoggedIn(),
		},
	};
};

export const fetchAndRenderHeaderLinks = async (): Promise<void> => {
	const requestData = buildHeaderLinksPayload();
	const isEnabled = config.get<boolean>('switches.remoteHeader', false);
	const { contentType } = window.guardian.config.page;

	if (!isEnabled || contentType === 'Gallery') {
		return;
	}

	try {
		const response = await getHeader(
			supportDotcomComponentsUrl,
			requestData,
		);
		if (!response.data) {
			return;
		}
		const { module } = response.data;
		const Header = await dynamicImport(module.url, module.name);

		const el = document.createElement('div');
		const container = document.querySelector('.new-header__cta-bar');
		if (container) {
			container.appendChild(el);

			mountDynamic(
				el,
				Header,
				{ submitComponentEvent, ...module.props },
				true,
			);
		}
	} catch (error) {
		/* eslint-disable @typescript-eslint/restrict-template-expressions -- error log */
		log('supporterRevenue', `Error importing remote header: ${error}`);
		reportError(
			new Error(`Error importing remote header: ${error}`),
			{},
			false,
		);
		/* eslint-enable @typescript-eslint/restrict-template-expressions */
	}
};
