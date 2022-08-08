import { getCookie, storage } from '@guardian/libs';
import { mergeCalls } from 'common/modules/async-call-merger';
import config from '../../../../lib/config';
import { fetchJson } from '../../../../lib/fetch-json';
import { mediator } from '../../../../lib/mediator';
import { getUrlVars } from '../../../../lib/url';
import { createAuthenticationComponentEventParams } from './auth-component-event-params';

// Types info coming from https://github.com/guardian/discussion-rendering/blob/fc14c26db73bfec8a04ff7a503ed9f90f1a1a8ad/src/types.ts

type SettableConsent = {
	id: string;
	consented: boolean;
};

type Newsletter = {
	id: string;
	subscribed?: boolean;
};

type UserNameError = {
	message: string;
	description: string;
	context: string;
};

type UserConsents = {
	id: string;
	actor: string;
	version: number;
	consented: boolean;
	timestamp: string;
	privacyPolicyVersion: number;
};

type UserGroups = {
	path: string;
	packageCode: string;
};

export type IdentityUser = {
	dates: { accountCreatedDate: string };
	consents: UserConsents[];
	userGroups: UserGroups[];
	publicFields: {
		username: string;
		displayName: string;
	};
	statusFields: {
		userEmailValidated: boolean;
	};
	privateFields: {
		brazeUuid: string;
		googleTagId: string;
		puzzleUuid: string;
		legacyPackages: string;
		legacyProducts: string;
	};
	primaryEmailAddress: string;
	id: number;
	hasPassword: boolean;
	adData: Record<string, unknown>;
};

type IdentityUserFromCache = {
	dates: { accountCreatedDate: string };
	publicFields: {
		displayName: string;
	};
	statusFields: {
		userEmailValidated: boolean;
	};
	primaryEmailAddress: string;
	id: number;
	rawResponse: string;
} | null;

type IdentityResponse = {
	status: 'ok' | 'error';
	user: IdentityUser;
	errors?: UserNameError[];
};

export type IdentityUserIdentifiers = {
	id: string;
	brazeUuid: string;
	puzzleId: string;
	googleTagId: string;
};

let userFromCookieCache: IdentityUserFromCache = null;

const cookieName = 'GU_U';
const signOutCookieName = 'GU_SO';
const fbCheckKey = 'gu.id.nextFbCheck';

const idApiRoot = config.get<string>(
	'page.idApiUrl',
	'/ID_API_ROOT_URL_NOT_FOUND',
);
const profileRoot = config.get<string>(
	'page.idUrl',
	'/PROFILE_ROOT_ID_URL_NOT_FOUND',
);
mediator.emit('module:identity:api:loaded');

export const decodeBase64 = (str: string): string =>
	decodeURIComponent(
		escape(
			window.atob(
				str.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '='),
			),
		),
	);

export const getUserFromCookie = (): IdentityUserFromCache => {
	if (userFromCookieCache === null) {
		const cookieData = getUserCookie();
		let userData: string[] | null = null;

		if (cookieData) {
			userData = JSON.parse(
				decodeBase64(cookieData.split('.')[0]),
			) as string[];
		}
		if (userData && cookieData) {
			const displayName = decodeURIComponent(userData[2]);
			userFromCookieCache = {
				id: parseInt(userData[0], 10),
				primaryEmailAddress: userData[1], // not sure where this is stored now - not in the cookie any more
				publicFields: {
					displayName,
				},
				dates: { accountCreatedDate: userData[6] },
				statusFields: {
					userEmailValidated: Boolean(userData[7]),
				},
				rawResponse: cookieData,
			};
		}
	}

	return userFromCookieCache;
};

export const updateNewsletter = (newsletter: Newsletter): Promise<void> => {
	const url = `${idApiRoot}/users/me/newsletters`;
	return fetch(url, {
		method: 'PATCH',
		credentials: 'include',
		mode: 'cors',
		body: JSON.stringify(newsletter),
	}).then(() => Promise.resolve());
};

export const buildNewsletterUpdatePayload = (
	action = 'none',
	newsletterId: string,
): Newsletter => {
	const newsletter: Newsletter = { id: newsletterId };
	switch (action) {
		case 'add':
			newsletter.subscribed = true;
			break;
		case 'remove':
			newsletter.subscribed = false;
			break;
		default:
			throw new Error(`Undefined newsletter action type (${action})`);
	}
	return newsletter;
};

export const isUserLoggedIn = (): boolean => getUserFromCookie() !== null;

export const getUserFromApi = mergeCalls(
	(mergingCallback: (u: IdentityUser | null) => void) => {
		if (isUserLoggedIn()) {
			const url = `${idApiRoot}/user/me`;
			void (
				fetchJson(url, {
					mode: 'cors',
					credentials: 'include',
				}) as Promise<IdentityResponse>
			) // assert unknown -> IdentityResponse
				.then((data: IdentityResponse) => {
					if (data.status === 'ok') {
						mergingCallback(data.user);
					} else {
						mergingCallback(null);
					}
				});
		} else {
			mergingCallback(null);
		}
	},
);

const fetchUserIdentifiers = () => {
	const url = `${idApiRoot}/user/me/identifiers`;
	return fetch(url, {
		mode: 'cors',
		credentials: 'include',
	})
		.then((resp) => {
			if (resp.status === 200) {
				return resp.json();
			} else {
				console.log(
					'failed to get Identity user identifiers',
					resp.status,
				);
				return null;
			}
		})
		.catch((e) => {
			console.log('failed to get Identity user identifiers', e);
			return null;
		});
};

export const getUserIdentifiersFromApi = mergeCalls(
	(mergingCallback: (u: IdentityUserIdentifiers | null) => void) => {
		if (isUserLoggedIn()) {
			void fetchUserIdentifiers().then((result) =>
				mergingCallback(result),
			);
		} else {
			mergingCallback(null);
		}
	},
);

export const reset = (): void => {
	getUserFromApi.reset();
	getUserIdentifiersFromApi.reset();
	userFromCookieCache = null;
};

const getUserCookie = (): string | null => getCookie({ name: cookieName });

export const getUrl = (): string => profileRoot;

export const getUserFromApiWithRefreshedCookie = (): Promise<unknown> => {
	const endpoint = `${idApiRoot}/user/me?refreshCookie=true`;
	return fetch(endpoint, {
		mode: 'cors',
		credentials: 'include',
	}).then((resp) => resp.json());
};

export const refreshOktaSession = (returnUrl: string): void => {
	const endpoint = `${profileRoot}/signin/refresh?returnUrl=${returnUrl}`;
	window.location.replace(endpoint);
};

export const redirectTo = (url: string): void => {
	window.location.assign(url);
};

// This needs to get out of here
type AuthenticationComponentId =
	| 'email_sign_in_banner'
	| 'subscription_sign_in_banner'
	| 'signin_from_formstack';

export const getUserOrSignIn = (
	componentId: AuthenticationComponentId,
	paramUrl: string | null,
): IdentityUserFromCache | void => {
	let returnUrl = paramUrl;

	if (isUserLoggedIn()) {
		return getUserFromCookie();
	}

	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- not sure what it would do
	returnUrl = encodeURIComponent(returnUrl || document.location.href);
	const url = [
		getUrl() || '',
		'/signin?returnUrl=',
		returnUrl,
		'&',
		createAuthenticationComponentEventParams(componentId),
	].join('');

	redirectTo(url);
};

export const hasUserSignedOutInTheLast24Hours = (): boolean => {
	const cookieData = getCookie({
		name: signOutCookieName,
	});

	if (cookieData) {
		return (
			Math.round(new Date().getTime() / 1000) <
			parseInt(cookieData, 10) + 86400
		);
	}
	return false;
};

export const shouldAutoSigninInUser = (): boolean => {
	const signedInUser = !!getUserCookie();
	const checkFacebook = !!storage.local.get(fbCheckKey);
	return (
		!signedInUser && !checkFacebook && !hasUserSignedOutInTheLast24Hours()
	);
};

export const sendValidationEmail = (): unknown => {
	const defaultReturnEndpoint = '/email-prefs';
	const endpoint = `${idApiRoot}/user/send-validation-email`;

	const returnUrlVar = getUrlVars().returnUrl;
	const returnUrl =
		typeof returnUrlVar === 'string'
			? decodeURIComponent(returnUrlVar)
			: profileRoot + defaultReturnEndpoint;

	const params = new URLSearchParams();
	params.append('returnUrl', returnUrl);

	const request = fetch(`${endpoint}?${params.toString()}`, {
		mode: 'cors',
		credentials: 'include',
		method: 'POST',
	});

	return request;
};

export const updateUsername = (username: string): unknown => {
	const endpoint = `${idApiRoot}/user/me`;
	const data = {
		publicFields: {
			username,
			displayName: username,
		},
	};
	const request = fetch(endpoint, {
		mode: 'cors',
		method: 'POST',
		body: JSON.stringify(data),
		credentials: 'include',
	});

	return request;
};

export const setConsent = (consents: SettableConsent): Promise<void> =>
	fetch(`${idApiRoot}/users/me/consents`, {
		method: 'PATCH',
		credentials: 'include',
		mode: 'cors',
		body: JSON.stringify(consents),
	}).then((resp) => {
		if (resp.ok) return Promise.resolve();
		return Promise.reject();
	});

export { getUserCookie as getCookie };
