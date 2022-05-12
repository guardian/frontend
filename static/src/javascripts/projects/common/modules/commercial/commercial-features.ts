import { log } from '@guardian/libs';
import defaultConfig from '../../../../lib/config';
import { getBreakpoint } from '../../../../lib/detect';
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

// Having a constructor means we can easily re-instantiate the object in a test
class CommercialFeatures {
	dfpAdvertising: boolean;
	isSecureContact: boolean;
	stickyTopBannerAd: boolean;
	articleBodyAdverts: boolean;
	carrotTrafficDriver: boolean;
	highMerch: boolean;
	thirdPartyTags: boolean;
	relatedWidgetEnabled: boolean;
	commentAdverts: boolean;
	liveblogAdverts: boolean;
	paidforBand: boolean;
	adFree: boolean;
	comscore: boolean;
	launchpad: boolean;
	youtubeAdvertising: boolean;

	constructor(config = defaultConfig) {
		// this is used for SpeedCurve tests
		const noadsUrl = /[#&]noads(&.*)?$/.test(window.location.hash);
		const forceAdFree = /[#&]noadsaf(&.*)?$/.test(window.location.hash);
		const forceAds = /[?&]forceads(&.*)?$/.test(window.location.search);
		const externalAdvertising = !noadsUrl && !userPrefs.isOff('adverts');
		const sensitiveContent =
			config.get<boolean>('page.shouldHideAdverts', false) ||
			config.get('page.section') === 'childrens-books-site';
		const isMinuteArticle = config.get<boolean>(
			'page.isMinuteArticle',
			false,
		);
		const isArticle = config.get('page.contentType') === 'Article';
		const isInteractive = config.get('page.contentType') === 'Interactive';
		const isLiveBlog = config.get<boolean>('page.isLiveBlog', false);
		const isHosted = config.get<boolean>('page.isHosted', false);
		const isIdentityPage =
			config.get('page.contentType') === 'Identity' ||
			config.get('page.section') === 'identity'; // needed for pages under profile.* subdomain
		const switches = config.get<Record<string, boolean>>('switches', {});
		const isWidePage = getBreakpoint() === 'wide';
		const supportsSticky =
			document.documentElement.classList.contains('has-sticky');
		const newRecipeDesign =
			config.get('page.showNewRecipeDesign') &&
			config.get('tests.abNewRecipeDesign');

		this.isSecureContact = [
			'help/ng-interactive/2017/mar/17/contact-the-guardian-securely',
			'help/2016/sep/19/how-to-contact-the-guardian-securely',
		].includes(config.get('page.pageId', ''));

		// Feature switches
		this.adFree = !!forceAdFree || isAdFreeUser();

		this.youtubeAdvertising = !this.adFree && !sensitiveContent;

		const dfpAdvertisingTrueConditions = {
			'switches.commercial': switches.commercial,
			externalAdvertising,
		};

		const dfpAdvertisingFalseConditions = {
			sensitiveContent,
			isIdentityPage,
			adFree: this.adFree,
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

		this.stickyTopBannerAd =
			!this.adFree &&
			!config.get('page.disableStickyTopBanner') &&
			!supportsSticky;

		const articleBodyAdvertsTrueConditions = {
			isArticle,
		};

		const articleBodyAdvertsFalseConditions = {
			isMinuteArticle,
			isLiveBlog,
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
			config.get<boolean>('switches.carrotTrafficDriver', false) &&
			!config.get<boolean>('page.isPaidContent');

		this.highMerch =
			this.dfpAdvertising &&
			!this.adFree &&
			!isMinuteArticle &&
			!isHosted &&
			!isInteractive &&
			!config.get<boolean>('page.isFront') &&
			!config.get<boolean>('isDotcomRendering', false) &&
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
			config.get('switches.redplanetForAus', false);

		this.relatedWidgetEnabled =
			this.dfpAdvertising &&
			!this.adFree &&
			!noadsUrl &&
			!sensitiveContent &&
			isArticle &&
			!config.get<boolean>('page.isPreview', false) &&
			config.get<boolean>('page.showRelatedContent', false) &&
			!(isUserLoggedIn() && config.get<boolean>('page.commentable'));

		this.commentAdverts =
			this.dfpAdvertising &&
			!this.adFree &&
			!isMinuteArticle &&
			config.get<boolean>('switches.enableDiscussionSwitch', false) &&
			config.get<boolean>('page.commentable', false) &&
			(!isLiveBlog || isWidePage);

		this.liveblogAdverts =
			isLiveBlog && this.dfpAdvertising && !this.adFree;

		this.paidforBand =
			config.get<boolean>('page.isPaidContent', false) && !supportsSticky;

		this.comscore =
			config.get<boolean>('switches.comscore', false) &&
			!isIdentityPage &&
			!this.isSecureContact;
	}
}

export const commercialFeatures = new CommercialFeatures();
export type CommercialFeaturesConstructor = typeof CommercialFeatures;
