import type {
	AccessTokenClaims,
	CustomClaims,
	IdentityAuthState,
} from '@guardian/identity-auth';
import { getIdentityAuth } from '@guardian/identity-auth-frontend';
import { reportError } from 'lib/report-error';

// the `id_token.profile.theguardian` scope is used to get custom claims
export type CustomIdTokenClaims = CustomClaims & {
	email: string;
	braze_uuid: string;
};

export async function isSignedInAuthState(): Promise<
	IdentityAuthState<AccessTokenClaims, CustomIdTokenClaims>
> {
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
