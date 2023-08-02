import type { AccessToken, IDToken } from '@guardian/identity-auth';
import { getCookie, storage } from '@guardian/libs';
import { mergeCalls } from 'common/modules/async-call-merger';
import { fetchJson } from '../../../../lib/fetch-json';
import { mediator } from '../../../../lib/mediator';
import { getUrlVars } from '../../../../lib/url';
import type { CustomIdTokenClaims } from './okta';

// Types info coming from https://github.com/guardian/discussion-rendering/blob/fc14c26db73bfec8a04ff7a503ed9f90f1a1a8ad/src/types.ts
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

let userFromCookieCache: IdentityUserFromCache = null;

const cookieName = 'GU_U';
const signOutCookieName = 'GU_SO';
const fbCheckKey = 'gu.id.nextFbCheck';

const idApiRoot =
	window.guardian.config.page.idApiUrl ?? '/ID_API_ROOT_URL_NOT_FOUND';

const profileRoot =
	window.guardian.config.page.idUrl ?? '/PROFILE_ROOT_ID_URL_NOT_FOUND';

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

type SignedOutWithCookies = { kind: 'SignedOutWithCookies' };
export type SignedInWithCookies = { kind: 'SignedInWithCookies' };
type SignedOutWithOkta = { kind: 'SignedOutWithOkta' };
export type SignedInWithOkta = {
	kind: 'SignedInWithOkta';
	accessToken: AccessToken<never>;
	idToken: IDToken<CustomIdTokenClaims>;
};

export type AuthStatus =
	| SignedOutWithCookies
	| SignedInWithCookies
	| SignedOutWithOkta
	| SignedInWithOkta;

// We want to be in the experiment if in the development environment
// or if we have opted in to the Okta server side experiment
const isInOktaExperiment =
	window.guardian.config.page.stage === 'DEV' ||
	window.guardian.config.tests?.oktaVariant === 'variant';

/**
 * Runs `inOkta` if the user is enrolled in the Okta experiment, otherwise runs `notInOkta`
 * @param inOkta runs if the user is enrolled in the Okta experiment
 * @param notInOkta runs if the user is **not** enrolled in the Okta experiment
 */
export const eitherInOktaExperimentOrElse = async <A, B>(
	inOkta: (authStatus: SignedInWithOkta | SignedOutWithOkta) => A,
	notInOkta: () => B,
): Promise<void> => {
	const authStatus = await getAuthStatus();
	switch (authStatus.kind) {
		case 'SignedInWithOkta':
		case 'SignedOutWithOkta':
			inOkta(authStatus);
			break;
		default:
			notInOkta();
	}
};

export const getAuthStatus = async (): Promise<AuthStatus> => {
	if (isInOktaExperiment) {
		const { isSignedInWithOktaAuthState } = await import('./okta');
		const authState = await isSignedInWithOktaAuthState();
		if (authState.isAuthenticated) {
			return {
				kind: 'SignedInWithOkta',
				accessToken: authState.accessToken,
				idToken: authState.idToken,
			};
		} else {
			return {
				kind: 'SignedOutWithOkta',
			};
		}
	} else {
		if (isUserLoggedIn()) {
			return {
				kind: 'SignedInWithCookies',
			};
		} else {
			return {
				kind: 'SignedOutWithCookies',
			};
		}
	}
};

export const isUserLoggedIn = (): boolean => getUserFromCookie() !== null;
export const isUserLoggedInOktaRefactor = (): Promise<boolean> =>
	getAuthStatus().then((authStatus) =>
		authStatus.kind === 'SignedInWithCookies' ||
		authStatus.kind === 'SignedInWithOkta'
			? true
			: false,
	);

/**
 * Decide request options based on an {@link AuthStatus}. Requests to authenticated APIs require different options depending on whether
 * you are in the Okta experiment or not.
 * @param authStatus
 * @returns where `authStatus` is:
 *
 * `SignedInWithCookies`:
 * - set the `credentials` option to `"include"`
 *
 * `SignedInWithOkta`:
 * - set the `Authorization` header with a Bearer Access Token
 * - set the `X-GU-IS-OAUTH` header to `true`
 */
export const getOptionsHeadersWithOkta = (
	authStatus: SignedInWithCookies | SignedInWithOkta,
): RequestInit => {
	if (authStatus.kind === 'SignedInWithCookies') {
		return {
			credentials: 'include',
		};
	}

	return {
		headers: {
			Authorization: `Bearer ${authStatus.accessToken.accessToken}`,
			'X-GU-IS-OAUTH': 'true',
		},
	};
};

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

/**
 * Fetch the logged in user's Braze UUID from IDAPI
 * @returns one of:
 * - string - the user's Braze UUID
 * - null - if the request failed
 */
const fetchBrazeUuidFromApi = (): Promise<string | null> =>
	fetch(`${idApiRoot}/user/me/identifiers`, {
		mode: 'cors',
		credentials: 'include',
	})
		.then((resp) => {
			if (resp.status === 200) {
				/* Ideally we would validate this response but this code will be
					deleted after the migration to Okta is complete
					Example response:
					{
						"id": "string",
						"brazeUuid": "string",
						"puzzleId": "string",
						"googleTagId": "string"
					}
				*/
				return resp.json() as Promise<{ brazeUuid: string }>;
			} else {
				throw resp.status;
			}
		})
		.then((json) => json.brazeUuid)
		.catch((e) => {
			console.log('failed to get Identity user identifiers', e);
			return null;
		});

/**
 * Get the user's Braze UUID
 *
 * If enrolled in the Okta experiment, return the value from the ID token
 * `braze_uuid` claim
 * Otherwise, fetch the Braze UUID from IDAPI
 * @returns one of:
 * - string, if the user is enrolled in the Okta experiment or the fetch to
 *   IDAPI was successful
 * - null, if the user is signed out or the fetch to IDAPI failed
 */
export const getBrazeUuid = (): Promise<string | null> =>
	getAuthStatus().then((authStatus) => {
		switch (authStatus.kind) {
			case 'SignedInWithCookies':
				return fetchBrazeUuidFromApi();
			case 'SignedInWithOkta':
				return authStatus.idToken.claims.braze_uuid;
			default:
				return null;
		}
	});

export const reset = (): void => {
	getUserFromApi.reset();
	userFromCookieCache = null;
};

const getUserCookie = (): string | null => getCookie({ name: cookieName });

export const getUrl = (): string => profileRoot;

export const refreshOktaSession = (returnUrl: string): void => {
	const endpoint = `${profileRoot}/signin/refresh?returnUrl=${returnUrl}`;
	window.location.replace(endpoint);
};

export const redirectTo = (url: string): void => {
	window.location.assign(url);
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

/**
 * Update the logged in user's username on IDAPI
 * @param username the new username
 * @returns {Promise<Response>} a Promise resolving to a {@link Response}
 */
export const updateUsername = (username: string): Promise<Response> =>
	getAuthStatus()
		.then((authStatus) =>
			authStatus.kind === 'SignedInWithCookies' ||
			authStatus.kind === 'SignedInWithOkta'
				? authStatus
				: Promise.reject('The user is not signed in'),
		)
		.then((signedInAuthStatus) => {
			const endpoint = `${idApiRoot}/user/me/username`;
			const data = {
				publicFields: {
					username,
					displayName: username,
				},
			};
			return fetch(endpoint, {
				mode: 'cors',
				method: 'POST',
				body: JSON.stringify(data),
				...getOptionsHeadersWithOkta(signedInAuthStatus),
			});
		});

export { getUserCookie as getCookie };
