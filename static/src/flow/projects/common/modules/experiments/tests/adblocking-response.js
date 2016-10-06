define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'lodash/collections/contains',
    'common/modules/commercial/user-features',
    'common/modules/commercial/survey/survey-adblock'
], function (
    $,
    config,
    detect,
    storage,
    contains,
    userFeatures,
    SurveyAdBlock
) {
    return function () {
        this.id = 'AdBlockingResponse3';
        this.start = '2016-09-28';
        this.expiry = '2016-10-14'; // this test will expire on Thurs 13th PM.
        this.author = 'Justin Pinner';
        this.description = 'Adblocking response test with ad-free option';
        this.audience = 0.12;
        this.audienceOffset = 0.13; // exclude anyone that would have been in the previous 12% v2 test
        this.successMeasure = 'Adblocking users show genuine interest in a paid ad-free service';
        this.audienceCriteria = 'Chrome desktop users with active adblocking software';
        var variantDataLinkNames = [
            ['adblock whitelist 300'],
            ['adblock supporter 300'],
            ['adblock subscriber 300'],
            ['adblock whitelist 500'],
            ['adblock supporter 500'],
            ['adblock subscriber 500'],
            ['adblock whitelist 1000'],
            ['adblock supporter 1000'],
            ['adblock subscriber 1000']
        ].map(function(_) {
            return _[0];
        }).join(', ');
        this.dataLinkNames = 'adblock response overlay: '+variantDataLinkNames+', subscriber number page: user help email';
        this.idealOutcome = 'Adblock users demonstrate that they would make contributions that will completely offset lost ad display revenue';
        this.hypothesis = 'Given the opportunity to pay for ad-free or whitelist the guardian more than 75% of adblock users choose one of these options';

        // NOTE: async adblock detection doesn't work reliably if the page is opened in a new tab

        this.canRun = function () {
            return contains('chrome', detect.getUserAgent.browser.toLowerCase()) &&
                contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint()) &&
                config.page.edition === 'UK' &&
                detect.adblockInUseSync();
        };

        var isQualified = function () {
            return detect.adblockInUseSync() &&
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
                !storage.local.get('gu.abb3.exempt') &&
                storage.local.get('gu.alreadyVisited') > 5 &&
                config.page.pageId !== 'contributor-email-page' &&
                config.page.pageId !== 'contributor-email-page-submitted';
        };

        this.variants = [{
            id: 'control',
            test: function(){}
        }, {
            id: '300',
            test: function () {
                if (isQualified()) {
                    var variant = '300',
                        whitelistText = 'Allow ads and browse for free',
                        adFreeButtonText = 'Remove ads for &pound;3/month',
                        adFreeMessagePrefix = '&pound;3 per month';

                    var surveyOverlay = new SurveyAdBlock({
                        whitelistText: whitelistText,
                        adFreeButtonText: adFreeButtonText,
                        adFreeMessagePrefix: adFreeMessagePrefix,
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
            id: '500',
            test: function () {
                if (isQualified()) {
                    var variant = '500',
                        whitelistText = 'Allow ads and browse for free',
                        adFreeButtonText = 'Remove ads for &pound;5/month',
                        adFreeMessagePrefix = '&pound;5 per month';

                    var surveyOverlay = new SurveyAdBlock({
                        whitelistText: whitelistText,
                        adFreeButtonText: adFreeButtonText,
                        adFreeMessagePrefix: adFreeMessagePrefix,
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
            id: '1000',
            test: function () {
                if (isQualified()) {
                    var variant = '1000',
                        whitelistText = 'Allow ads and browse for free',
                        adFreeButtonText = 'Remove ads for &pound;10/month',
                        adFreeMessagePrefix = '&pound;10 per month';

                    var surveyOverlay = new SurveyAdBlock({
                        whitelistText: whitelistText,
                        adFreeButtonText: adFreeButtonText,
                        adFreeMessagePrefix: adFreeMessagePrefix,
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
