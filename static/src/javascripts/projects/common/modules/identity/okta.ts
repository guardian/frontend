import type {
	AccessTokenClaims,
	CustomClaims,
	IdentityAuthState,
} from '@guardian/identity-auth';
import { IdentityAuth } from '@guardian/identity-auth';
import config from 'lib/config';
import { reportError } from 'lib/report-error';

// the `id_token.profile.theguardian` scope is used to get custom claims
export type CustomIdTokenClaims = CustomClaims & {
	email: string;
	braze_uuid: string;
	// Used by Commercial
	google_tag_id: string;
};

export type AuthState = IdentityAuthState<
	AccessTokenClaims,
	CustomIdTokenClaims
>;

const getStage = () => {
	return window.guardian.config.page.stage;
};

const getIssuer = (stage: Stage) =>
	stage === 'PROD'
		? 'https://profile.theguardian.com/oauth2/aus3xgj525jYQRowl417'
		: 'https://profile.code.dev-theguardian.com/oauth2/aus3v9gla95Toj0EE0x7';

const getClientId = (stage: Stage) =>
	stage === 'PROD' ? '0oa79m1fmgzrtaHc1417' : '0oa53x6k5wGYXOGzm0x7';

const getRedirectUri = (stage: Stage) => {
	switch (stage) {
		case 'PROD':
			return 'https://www.theguardian.com/';
		case 'CODE':
			return 'https://m.code.dev-theguardian.com/';
		case 'DEV':
		default:
			return 'http://localhost:9000/';
	}
};

let identityAuth:
	| IdentityAuth<AccessTokenClaims, CustomIdTokenClaims>
	| undefined;

function getIdentityAuth() {
	if (identityAuth === undefined) {
		const stage = getStage();

		identityAuth = new IdentityAuth<AccessTokenClaims, CustomIdTokenClaims>(
			{
				issuer: getIssuer(stage),
				clientId: getClientId(stage),
				redirectUri: getRedirectUri(stage),
				scopes: [
					'openid', // required for open id connect, returns an id token
					'profile', // populates the id token with basic profile information
					'email', // populates the id token with the user's email address
					'guardian.discussion-api.private-profile.read.self', // allows the access token to be used to make requests to the discussion api to read the user's profile
					'guardian.discussion-api.update.secure', // allows the access token to be used to make requests to the discussion api to post comments, upvote etc
					'guardian.identity-api.newsletters.read.self', // allows the access token to be used to make requests to the identity api to read the user's newsletter subscriptions
					'guardian.identity-api.newsletters.update.self', // allows the access token to be used to make requests to the identity api to update the user's newsletter subscriptions
					'guardian.identity-api.user.username.create.self.secure', // allows the access token to set the user's username
					'guardian.members-data-api.read.self', // allows the access token to be used to make requests to the members data api to read the user's membership status
					'id_token.profile.theguardian', // populates the id token with application specific profile information
				],
				idCookieSessionRefresh:
					config.get('switches.idCookieRefresh') ?? false,
			},
		);
	}
	return identityAuth;
}

export async function isSignedInWithOktaAuthState(): Promise<AuthState> {
	return getIdentityAuth()
		.isSignedInWithAuthState()
		.catch((e) => {
			reportError(e, { feature: 'okta' }, true);
			return {
				isAuthenticated: false,
				idToken: undefined,
				accessToken: undefined,
			};
		});
}
