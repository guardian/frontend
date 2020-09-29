
import defaultConfig from "lib/config";
import { getBreakpoint } from "lib/detect";
import { isAdFreeUser } from "common/modules/commercial/user-features";
import { isUserLoggedIn } from "common/modules/identity/api";
import userPrefs from "common/modules/user-prefs";

// Having a constructor means we can easily re-instantiate the object in a test
class CommercialFeatures {

  dfpAdvertising: boolean;

  isSecureContact: boolean;

  stickyTopBannerAd: boolean;

  articleBodyAdverts: boolean;

  articleAsideAdverts: boolean;

  carrotTrafficDriver: boolean;

  highMerch: boolean;

  thirdPartyTags: boolean;

  relatedWidgetEnabled: boolean;

  plista: boolean;

  commentAdverts: boolean;

  liveblogAdverts: boolean;

  paidforBand: boolean;

  asynchronous: boolean;

  adFree: boolean;

  comscore: boolean;

  launchpad: boolean;

  constructor(config: any = defaultConfig) {
    // this is used for SpeedCurve tests
    const noadsUrl: boolean = /[#&]noads(&.*)?$/.test(window.location.hash);
    const forceAdFree: boolean = /[#&]noadsaf(&.*)?$/.test(window.location.hash);
    const forceAds: boolean = /[?&]forceads(&.*)?$/.test(window.location.search);
    const externalAdvertising = !noadsUrl && !userPrefs.isOff('adverts');
    const sensitiveContent = config.get('page.shouldHideAdverts') || config.get('page.section') === 'childrens-books-site';
    const isMinuteArticle = config.get('page.isMinuteArticle');
    const isArticle = config.get('page.contentType') === 'Article';
    const isInteractive = config.get('page.contentType') === 'Interactive';
    const isLiveBlog = config.get('page.isLiveBlog');
    const isHosted = config.get('page.isHosted');
    const isIdentityPage = config.get('page.contentType') === 'Identity' || config.get('page.section') === 'identity'; // needed for pages under profile.* subdomain
    const switches = config.get('switches');
    const isWidePage = getBreakpoint() === 'wide';
    const supportsSticky = document.documentElement && document.documentElement.classList.contains('has-sticky');
    const newRecipeDesign = config.get('page.showNewRecipeDesign') && config.get('tests.abNewRecipeDesign');

    this.isSecureContact = ['help/ng-interactive/2017/mar/17/contact-the-guardian-securely', 'help/2016/sep/19/how-to-contact-the-guardian-securely'].includes(config.get('page.pageId', ''));

    // Feature switches
    this.adFree = !!forceAdFree || isAdFreeUser();

    this.dfpAdvertising = forceAds || (switches.commercial && externalAdvertising && !sensitiveContent && !isIdentityPage && !this.adFree);

    this.stickyTopBannerAd = !this.adFree && !config.get('page.disableStickyTopBanner') && !supportsSticky;

    this.articleBodyAdverts = this.dfpAdvertising && !this.adFree && !isMinuteArticle && isArticle && !isLiveBlog && !isHosted && !newRecipeDesign;

    this.carrotTrafficDriver = !this.adFree && this.articleBodyAdverts && config.get('switches.carrotTrafficDriver', false) && !config.get('page.isPaidContent');

    this.highMerch = this.dfpAdvertising && !this.adFree && !isMinuteArticle && !isHosted && !isInteractive && !config.get('page.isFront') && !newRecipeDesign;

    this.thirdPartyTags = !this.adFree && externalAdvertising && !isIdentityPage && !this.isSecureContact;

    this.launchpad = !this.adFree && externalAdvertising && !isIdentityPage && !this.isSecureContact && config.get('switches.redplanetForAus', false);

    this.relatedWidgetEnabled = this.dfpAdvertising && !this.adFree && !noadsUrl && !sensitiveContent && isArticle && !config.get('page.isPreview') && config.get('page.showRelatedContent') && !(isUserLoggedIn() && config.get('page.commentable'));

    this.plista = this.relatedWidgetEnabled && switches.plistaForAu;

    this.commentAdverts = this.dfpAdvertising && !this.adFree && !isMinuteArticle && config.get('switches.enableDiscussionSwitch') && config.get('page.commentable') && (!isLiveBlog || isWidePage);

    this.liveblogAdverts = isLiveBlog && this.dfpAdvertising && !this.adFree;

    this.paidforBand = config.get('page.isPaidContent') && !supportsSticky;

    this.comscore = config.get('switches.comscore', false) && !isIdentityPage && !this.isSecureContact;
  }
}

export const commercialFeatures = new CommercialFeatures();