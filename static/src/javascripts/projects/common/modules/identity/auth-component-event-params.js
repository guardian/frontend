import { constructQuery } from '../../../../lib/url';

export const createAuthenticationComponentEvent = (componentId, pageViewId) => {
	const params = {
		componentType: 'identityauthentication',
		componentId,
	};

	if (pageViewId) {
		params.viewId = pageViewId;
	}

	return constructQuery(params);
};

export const createAuthenticationComponentEventParams = (
	componentId,
	pageViewId,
) =>
	`componentEventParams=${encodeURIComponent(
		createAuthenticationComponentEvent(componentId, pageViewId),
	)}`;
