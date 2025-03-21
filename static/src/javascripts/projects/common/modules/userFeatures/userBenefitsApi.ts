import { isObject } from '@guardian/libs';
import type { SignedIn } from '../identity/api';
import { getOptionsHeaders } from '../identity/api';
import { fetchJson } from './fetchJson';
import type { UserBenefits } from './user-features';

type UserBenefitsResponse = {
	benefits: string[];
};
export const syncDataFromUserBenefitsApi = async (
	signedInAuthStatus: SignedIn,
): Promise<UserBenefits> => {
	const url = window.guardian.config.page.userBenefitsApiUrl;
	if (!url) {
		throw new Error('userBenefitsApiUrl is not defined');
	}
	const response = await fetchJson(url, {
		mode: 'cors',
		...getOptionsHeaders(signedInAuthStatus),
	});
	if (!validateResponse(response)) {
		throw new Error('invalid response');
	}
	return {
		hideSupportMessaging: response.benefits.includes(
			'hideSupportMessaging',
		),
		adFree: response.benefits.includes('adFree'),
		allowRejectAll: response.benefits.includes('allowRejectAll'),
	};
};

const validateResponse = (
	response: unknown,
): response is UserBenefitsResponse => {
	return isObject(response) && Array.isArray(response.benefits);
};
