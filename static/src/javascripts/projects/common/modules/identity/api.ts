import type {
	AccessToken,
	AccessTokenClaims,
	IDToken,
} from '@guardian/identity-auth';
import { getCookie } from '@guardian/libs';
import { mediator } from 'lib/mediator';
import type { CustomIdTokenClaims } from './okta';

export type IdentityUser = {
	primaryEmailAddress: string;
	statusFields: {
		userEmailValidated: boolean;
	};
};

type IdentityUserFromCache = {
	dates: { accountCreatedDate: string };
	publicFields: {
		displayName: string;
	};
	statusFields: {
		userEmailValidated: boolean;
	};
	id: number;
	rawResponse: string;
} | null;

let userFromCookieCache: IdentityUserFromCache = null;

const cookieName = 'GU_U';

const idApiRoot =
	window.guardian.config.page.idApiUrl ?? '/ID_API_ROOT_URL_NOT_FOUND';

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

type SignedOut = { kind: 'SignedOut' };
export type SignedIn = {
	kind: 'SignedIn';
	accessToken: AccessToken<AccessTokenClaims>;
	idToken: IDToken<CustomIdTokenClaims>;
};

export type AuthStatus =
	| SignedOut
	| SignedIn;

export const getAuthStatus = async (): Promise<AuthStatus> => {
		const { isSignedInAuthState } = await import('./okta');
		const authState = await isSignedInAuthState();
		if (authState.isAuthenticated) {
			return {
				kind: 'SignedIn',
				accessToken: authState.accessToken,
				idToken: authState.idToken,
			};
		} else {
			return {
				kind: 'SignedOut',
			};
		}
};

export const isUserLoggedIn = (): Promise<boolean> =>
	getAuthStatus().then((authStatus) =>
		authStatus.kind === 'SignedIn',
	);

/**
 * Decide request options based on an {@link AuthStatus}.
 * @param authStatus
 * @returns where `authStatus` is:
 *
 * `SignedIn`:
 * - set the `Authorization` header with a Bearer Access Token
 * - set the `X-GU-IS-OAUTH` header to `true`
 */
export const getOptionsHeaders = (
	authStatus: SignedIn,
): RequestInit => {
	return {
		headers: {
			Authorization: `Bearer ${authStatus.accessToken.accessToken}`,
			'X-GU-IS-OAUTH': 'true',
		},
	};
};

/**
 * Get the user's data
 *
 * Return the data from the ID token
 * @returns
 * - IdentityUser
 * - null, if the user is signed out
 */
export const getUserData = async (): Promise<IdentityUser | null> =>
	getAuthStatus().then((authStatus) => {
		switch (authStatus.kind) {
			case 'SignedIn': {
				return {
					primaryEmailAddress: authStatus.idToken.claims.email,
					statusFields: {
						userEmailValidated:
							authStatus.accessToken.claims.email_validated,
					},
				};
			}
			default:
				return null;
		}
	});

/**
 * Get the user's Braze UUID
 *
 * Return the value from the ID token
 * `braze_uuid` claim
 * @returns
 * - string
 * - null, if the user is signed out
 */
export const getBrazeUuid = (): Promise<string | null> =>
	getAuthStatus().then((authStatus) => {
		switch (authStatus.kind) {
			case 'SignedIn':
				return authStatus.idToken.claims.braze_uuid;
			default:
				return null;
		}
	});

export const reset = (): void => {
	userFromCookieCache = null;
};

const getUserCookie = (): string | null => getCookie({ name: cookieName });

/**
 * Update the logged in user's username on IDAPI
 * @param username the new username
 * @returns {Promise<Response>} a Promise resolving to a {@link Response}
 */
export const updateUsername = (username: string): Promise<Response> =>
	getAuthStatus()
		.then((authStatus) =>
			authStatus.kind === 'SignedIn'
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
				...getOptionsHeaders(signedInAuthStatus),
			});
		});

export { getUserCookie as getCookie };
