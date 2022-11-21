import { onConsent } from '@guardian/consent-management-platform';
import { initArticleInline } from 'commercial/modules/consentless/dynamic/article-inline';
import { initLiveblogInline } from 'commercial/modules/consentless/dynamic/liveblog-inline';
import { initFixedSlots } from 'commercial/modules/consentless/init-fixed-slots';
import { initConsentless } from 'commercial/modules/consentless/prepare-ootag';
import {
	AdFreeCookieReasons,
	maybeUnsetAdFreeCookie,
} from 'lib/manage-ad-free-cookie';
import { init as setAdTestCookie } from '../projects/commercial/modules/set-adtest-cookie';
import { init as setAdTestInLabelsCookie } from '../projects/commercial/modules/set-adtest-in-labels-cookie';

const bootConsentless = async (): Promise<void> => {
	/*  In the consented ad stack, we set the ad free cookie for users who
		don't consent to targeted ads in order to hide empty ads slots.
		We remove the cookie here so that we can show Opt Out ads.
		TODO: Stop setting ad free cookie for users who opt out when
		consentless ads are rolled out to all users.
 	*/
	maybeUnsetAdFreeCookie(AdFreeCookieReasons.ConsentOptOut);

	const consentState = await onConsent();

	await Promise.all([
		setAdTestCookie(),
		setAdTestInLabelsCookie(),
		initConsentless(consentState),
		initFixedSlots(),
		initArticleInline(),
		initLiveblogInline(),
	]);

	// Since we're in single-request mode
	// Call this once all ad slots are present on the page
	window.ootag.makeRequests();
};

export { bootConsentless };
