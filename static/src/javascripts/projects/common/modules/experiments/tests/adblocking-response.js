define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'lodash/collections/contains',
    'common/modules/commercial/user-features',
    'common/modules/commercial/survey/survey-adblock',
    'common/utils/cookies'
], function (
    $,
    config,
    detect,
    storage,
    contains,
    userFeatures,
    SurveyAdBlock,
    cookies
) {
    return function () {
        this.id = 'AdBlockingResponse3';
        this.start = '2016-09-26';
        this.expiry = '2016-10-11'; // the test will STOP on MONDAY 10th PM. Test dates don't behave like our switches.
        this.author = 'Justin Pinner';
        this.description = 'Adblocking response with ad-free 404 demand test';
        this.audience = 0;  // TODO: audience sizing
        this.audienceOffset = 0;
        this.successMeasure = 'Adblocking users show genuine interest in a paid ad-free service';
        this.audienceCriteria = 'Chrome desktop users with active adblocking software';
        var variantDataLinkNames = [
            ['adblock whitelist no-close'],
            ['adblock supporter no-close'],
            ['adblock subscriber no-close']
        ].map(function(_) {
            return _[0];
        }).join(', ');
        this.dataLinkNames = 'adblock response overlay: '+variantDataLinkNames+', subscriber number page: user help email';
        this.idealOutcome = 'Adblock users demonstrate that they would make contributions that will completely offset lost ad display revenue';
        this.hypothesis = 'Given the opportunity to pay for ad-free or whitelist the guardian more than 75% of adblock users choose one of these options';

        this.canRun = function () {
            return contains('chrome', detect.getUserAgent.browser.toLowerCase()) &&
                contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint()) &&
                config.page.edition === 'UK' &&
                detect.adblockInUseSync();
        };

        var isQualified = function () {
            // NOTE: async adblock detection doesn't work if the page is opened in a new tab
            return detect.adblockInUseSync() &&
                !cookies.get('gu_abm_x') &&
                (cookies.get('GU_geo_continent') && cookies.get('GU_geo_continent').toUpperCase() === 'EU') &&
                !config.page.isFront &&
                !config.page.shouldHideAdverts &&
                config.page.section !== 'childrens-books-site' &&
                !userFeatures.isPayingMember() &&
                config.page.webTitle !== 'Subscriber number form' &&
                config.page.webTitle !== 'How to disable your adblocker for theguardian.com' &&
                config.page.webTitle !== 'How to contact the Guardian and Observer' &&
                storage.local.isStorageAvailable() &&
                !storage.local.get('gu.subscriber') &&
                !storage.local.get('gu.contributor') &&
                storage.local.get('gu.alreadyVisited') > 5 &&
                config.page.pageId !== 'contributor-email-page' &&
                config.page.pageId !== 'contributor-email-page-submitted';
        };

        this.variants = [{
            id: 'control',
            test: function(){}
        }, {
            id: '299',
            test: function () {
                if (isQualified()) {
                    var variant = '299',
                        whitelistText = 'Allow ads and browse for free',
                        adFreeText = 'Ad free &pound;2.99/month',
                        header = 'Advertising helps fund our journalism';

                    var surveyOverlay = new SurveyAdBlock({
                        whitelistText: whitelistText,
                        adFreeText: adFreeText,
                        surveyHeader: header,
                        whitelistGuideImage: config.images.commercial['abp-whitelist-instruction-chrome'],
                        adBlockIcon: config.images.commercial['ab-icon'],
                        adBlockPlusIcon: config.images.commercial['abp-icon'],
                        variant: variant
                    });
                    surveyOverlay.attach();
                    surveyOverlay.show();
                }
            }
        }, {
            id: '499',
            test: function () {
                if (isQualified()) {
                    var variant = '499',
                        whitelistText = 'Allow ads and browse for free',
                        adFreeText = 'Ad free &pound;4.99/month',
                        header = 'Advertising helps fund our journalism';

                    var surveyOverlay = new SurveyAdBlock({
                        whitelistText: whitelistText,
                        adFreeText: adFreeText,
                        surveyHeader: header,
                        whitelistGuideImage: config.images.commercial['abp-whitelist-instruction-chrome'],
                        adBlockIcon: config.images.commercial['ab-icon'],
                        adBlockPlusIcon: config.images.commercial['abp-icon'],
                        variant: variant
                    });
                    surveyOverlay.attach();
                    surveyOverlay.show();
                }
            }
        }, {
            id: '999',
            test: function () {
                if (isQualified()) {
                    var variant = '999',
                        whitelistText = 'Allow ads and browse for free',
                        adFreeText = 'Ad free &pound;9.99/month',
                        header = 'Advertising helps fund our journalism';

                    var surveyOverlay = new SurveyAdBlock({
                        whitelistText: whitelistText,
                        adFreeText: adFreeText,
                        surveyHeader: header,
                        whitelistGuideImage: config.images.commercial['abp-whitelist-instruction-chrome'],
                        adBlockIcon: config.images.commercial['ab-icon'],
                        adBlockPlusIcon: config.images.commercial['abp-icon'],
                        variant: variant
                    });
                    surveyOverlay.attach();
                    surveyOverlay.show();
                }
            }
        }];

    };

});
