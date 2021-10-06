import { storage } from '@guardian/libs';
import { mergeCalls } from 'common/modules/async-call-merger';
import config from '../../../../lib/config';
import { getCookie as getCookieByName } from '../../../../lib/cookies';
import { fetchJson } from '../../../../lib/fetch-json';
import mediator from '../../../../lib/mediator';
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
	id: string;
	hasPassword: boolean;
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
	id: string;
	rawResponse: string;
} | null;

type IdentityResponse = {
	status: 'ok' | 'error';
	user: IdentityUser;
	errors?: UserNameError[];
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
		const cookieData = getCookieByName(cookieName) as string;
		let userData = null;

		if (cookieData) {
			userData = JSON.parse(
				decodeBase64(cookieData.split('.')[0]),
			) as string[];
		}
		if (userData) {
			const displayName = decodeURIComponent(userData[2]);
			userFromCookieCache = {
				id: userData[0],
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
			void (fetchJson(url, {
				mode: 'cors',
				credentials: 'include',
			}) as Promise<IdentityResponse>) // assert unknown -> IdentityResponse
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

export const reset = (): void => {
	getUserFromApi.reset();
	userFromCookieCache = null;
};

export const getCookie = (): string | null =>
	getCookieByName(cookieName) as string | null;

export const getUrl = (): string => profileRoot;

export const getUserFromApiWithRefreshedCookie = (): Promise<unknown> => {
	const endpoint = `${idApiRoot}/user/me?refreshCookie=true`;
	return fetch(endpoint, {
		mode: 'cors',
		credentials: 'include',
	}).then((resp) => resp.json());
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
	const cookieData = getCookieByName(signOutCookieName) as string;

	if (cookieData) {
		return (
			Math.round(new Date().getTime() / 1000) <
			parseInt(cookieData, 10) + 86400
		);
	}
	return false;
};

export const shouldAutoSigninInUser = (): boolean => {
	const signedInUser = !!getCookieByName(cookieName);
	const checkFacebook = !!storage.local.get(fbCheckKey);
	return (
		!signedInUser && !checkFacebook && !hasUserSignedOutInTheLast24Hours()
	);
};

export const getUserEmailSignUps = (): Promise<unknown> => {
	const user = getUserFromCookie();

	if (user) {
		const endpoint = `${idApiRoot}/useremails/${user.id}`;
		const request = fetch(endpoint, {
			mode: 'cors',
			credentials: 'include',
		}).then((resp) => resp.json());

		return request;
	}

	return Promise.resolve(null);
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

export const getAllConsents = (): Promise<unknown> => {
	const endpoint = '/consents';
	const url = idApiRoot + endpoint;
	return fetchJson(url, {
		mode: 'cors',
		method: 'GET',
		headers: { Accept: 'application/json' },
	});
};

export const getAllNewsletters = (): Promise<unknown> => {
	const endpoint = '/newsletters';
	const url = idApiRoot + endpoint;
	return fetchJson(url, {
		mode: 'cors',
		method: 'GET',
		headers: { Accept: 'application/json' },
	});
};

export const getSubscribedNewsletters = (): Promise<string[]> => {
	const endpoint = '/users/me/newsletters';
	const url = idApiRoot + endpoint;

	type Subscriptions = {
		listId: string;
	};

	type NewslettersResponse =
		| {
				result?: {
					globalSubscriptionStatus?: string;
					htmlPreference?: string;
					subscriptions?: Subscriptions[];
					status?: 'ok' | string;
				};
		  }
		| undefined;

	return (fetchJson(url, {
		mode: 'cors',
		method: 'GET',
		headers: { Accept: 'application/json' },
		credentials: 'include',
	}) as Promise<NewslettersResponse>) // assert unknown -> NewslettersResponse
		.then((json: NewslettersResponse) => {
			if (json?.result?.subscriptions) {
				return json.result.subscriptions.map((sub) => sub.listId);
			}
			return [];
		})
		.catch(() => []);
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

export const getUserData = (): Promise<unknown> =>
	fetchJson(`${idApiRoot}/user/me`, {
		method: 'GET',
		mode: 'cors',
		credentials: 'include',
	});
