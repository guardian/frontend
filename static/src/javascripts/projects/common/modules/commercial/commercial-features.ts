import { log } from '@guardian/libs';
import { getCurrentBreakpoint } from 'lib/detect-breakpoint';
import { isUserLoggedIn } from '../identity/api';
import userPrefs from '../user-prefs';
import { isAdFreeUser } from './user-features';

/**
 * Log the reason why adverts are disabled
 *
 * @param trueConditions - normally true conditions, log if false
 * @param falseConditions - normally false conditions, log if true
 */
function adsDisabledLogger(
	trueConditions: Record<string, boolean>,
	falseConditions: Record<string, boolean>,
): void {
	const noAdsLog = (condition: string, value: boolean): void =>
		log(
			'commercial',
			`Adverts are not shown because ${condition} = ${String(value)}`,
		);

	for (const [condition, value] of Object.entries(trueConditions)) {
		if (!value) noAdsLog(condition, value);
	}

	for (const [condition, value] of Object.entries(falseConditions)) {
		if (value) noAdsLog(condition, value);
	}
}

/**
 * Determine whether current browser is a version of Internet Explorer
 */
const isInternetExplorer = () => {
	return !!navigator.userAgent.match(/MSIE|Trident/g)?.length;
};

// Having a constructor means we can easily re-instantiate the object in a test
class CommercialFeatures {
	dfpAdvertising: boolean;
	isSecureContact: boolean;
	articleBodyAdverts: boolean;
	carrotTrafficDriver: boolean;
	highMerch: boolean;
	thirdPartyTags: boolean;
	relatedWidgetEnabled: boolean;
	commentAdverts: boolean;
	liveblogAdverts: boolean;
	adFree: boolean;
	comscore: boolean;
	launchpad: boolean;
	youtubeAdvertising: boolean;

	constructor() {
		// this is used for SpeedCurve tests
		const noadsUrl = /[#&]noads(&.*)?$/.test(window.location.hash);
		const forceAdFree = /[#&]noadsaf(&.*)?$/.test(window.location.hash);
		const forceAds = /[?&]forceads(&.*)?$/.test(window.location.search);
		const externalAdvertising = !noadsUrl && !userPrefs.isOff('adverts');
		const sensitiveContent =
			window.guardian.config.page.shouldHideAdverts ||
			window.guardian.config.page.section === 'childrens-books-site';
		const isMinuteArticle = window.guardian.config.page.isMinuteArticle;
		const isArticle = window.guardian.config.page.contentType === 'Article';
		const isInteractive =
			window.guardian.config.page.contentType === 'Interactive';
		const isLiveBlog = window.guardian.config.page.isLiveBlog;
		const isHosted = window.guardian.config.page.isHosted;
		const isIdentityPage =
			window.guardian.config.page.contentType === 'Identity' ||
			window.guardian.config.page.section === 'identity'; // needed for pages under profile.* subdomain
		const switches = window.guardian.config.switches;
		const isWidePage = getCurrentBreakpoint() === 'wide';
		const newRecipeDesign = window.guardian.config.page.showNewRecipeDesign;

		// TODO Convert detect.js to TypeScript
		const isUnsupportedBrowser: boolean = isInternetExplorer();

		this.isSecureContact = [
			'help/ng-interactive/2017/mar/17/contact-the-guardian-securely',
			'help/2016/sep/19/how-to-contact-the-guardian-securely',
		].includes(window.guardian.config.page.pageId);

		// Feature switches
		this.adFree = !!forceAdFree || isAdFreeUser();

		this.youtubeAdvertising = !this.adFree && !sensitiveContent;

		const dfpAdvertisingTrueConditions = {
			'switches.commercial': !!switches.commercial,
			externalAdvertising,
		};

		const dfpAdvertisingFalseConditions = {
			sensitiveContent,
			isIdentityPage,
			adFree: this.adFree,
			isUnsupportedBrowser,
		};

		this.dfpAdvertising =
			forceAds ||
			(Object.values(dfpAdvertisingTrueConditions).every(Boolean) &&
				!Object.values(dfpAdvertisingFalseConditions).some(Boolean));

		if (!this.dfpAdvertising) {
			adsDisabledLogger(
				dfpAdvertisingTrueConditions,
				dfpAdvertisingFalseConditions,
			);
		}

		const articleBodyAdvertsTrueConditions = {
			isArticle,
		};

		const articleBodyAdvertsFalseConditions = {
			isMinuteArticle,
			isLiveBlog: !!isLiveBlog,
			isHosted,
			newRecipeDesign: !!newRecipeDesign,
		};

		this.articleBodyAdverts =
			this.dfpAdvertising &&
			!this.adFree &&
			Object.values(articleBodyAdvertsTrueConditions).every(Boolean) &&
			!Object.values(articleBodyAdvertsFalseConditions).some(Boolean);

		if (isArticle && !this.articleBodyAdverts) {
			// Log why article adverts are disabled
			adsDisabledLogger(
				articleBodyAdvertsTrueConditions,
				articleBodyAdvertsFalseConditions,
			);
		}

		this.carrotTrafficDriver =
			!this.adFree &&
			this.articleBodyAdverts &&
			!!window.guardian.config.switches.carrotTrafficDriver &&
			!window.guardian.config.page.isPaidContent;

		this.highMerch =
			this.dfpAdvertising &&
			!this.adFree &&
			!isMinuteArticle &&
			!isHosted &&
			!isInteractive &&
			!window.guardian.config.page.isFront &&
			!window.guardian.config.isDotcomRendering &&
			!newRecipeDesign;

		this.thirdPartyTags =
			!this.adFree &&
			externalAdvertising &&
			!isIdentityPage &&
			!this.isSecureContact;

		this.launchpad =
			!this.adFree &&
			externalAdvertising &&
			!isIdentityPage &&
			!this.isSecureContact &&
			!!window.guardian.config.switches.redplanetForAus;

		this.relatedWidgetEnabled =
			this.dfpAdvertising &&
			!this.adFree &&
			!noadsUrl &&
			!sensitiveContent &&
			isArticle &&
			!window.guardian.config.page.isPreview &&
			!!window.guardian.config.page.showRelatedContent &&
			!(isUserLoggedIn() && window.guardian.config.page.commentable);

		this.commentAdverts =
			this.dfpAdvertising &&
			!this.adFree &&
			!isMinuteArticle &&
			!!window.guardian.config.switches.enableDiscussionSwitch &&
			window.guardian.config.page.commentable &&
			(!isLiveBlog || isWidePage);

		this.liveblogAdverts =
			!!isLiveBlog && this.dfpAdvertising && !this.adFree;

		this.comscore =
			!!window.guardian.config.switches.comscore &&
			!isIdentityPage &&
			!this.isSecureContact;
	}
}

export const commercialFeatures = new CommercialFeatures();
export type CommercialFeaturesConstructor = typeof CommercialFeatures;
