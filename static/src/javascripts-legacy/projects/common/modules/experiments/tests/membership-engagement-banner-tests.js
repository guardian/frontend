define([
    'bean',
    'qwery',
    'lib/config',
    'lib/storage',
    'lodash/utilities/template',
    'common/modules/commercial/contributions-utilities',
    'lib/mediator'
], function (
    bean,
    qwery,
    config,
    storage,
    template,
    contributionsUtilities,
    mediator) {
    var EditionTest = function (edition, id, start, expiry, campaignPrefix) {

        this.edition = edition;
        this.campaignPrefix = campaignPrefix;
        this.id = id;
        this.start = start;
        this.expiry = expiry;
        this.author = 'Roberto Tyley';
        this.description = 'Show contributions/membership messages for the ' + edition + ' edition.';
        this.showForSensitive = false;
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Conversion';
        this.audienceCriteria = 'All users in the ' + edition + ' edition.';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        // Required by the A/B testing framework - can not be async, unfortunately
        this.canRun = function () {
            var matchesEdition = config.page.edition == edition;
            return matchesEdition && contributionsUtilities.shouldShowReaderRevenue();
        };

        this.completer = function (complete) {
            mediator.on('membership-message:display', function () {
                /* When the button link is clicked, call the function that indicates the A/B test is 'complete'
                 * ...note that for Membership & Contributions this completion is only the start of a longer
                 * journey that will hopefully end pages later with the user giving us money.
                 */
                bean.on(qwery('#membership__engagement-message-link')[0], 'click', complete);
            });
        };

        this.variants = [];

    };

    EditionTest.prototype.addMessageVariant = function (variantId, variantParams) {
        this.variants.push({
            id: variantId,
            engagementBannerParams: variantParams,
            /*  We don't want to run any 'code' in this test, we just want a variant to be selected. All message display
             * is performed in membership-engagement-banner.js, modifying the banner using the data in variantParams.
             */
            test: function () {},
            success: this.completer
        });
        return this;
    };

    EditionTest.prototype.addMembershipVariant = function (variantId, variantParams) {
        variantParams.campaignCode = this.campaignPrefix + variantId;
        return this.addMessageVariant(variantId, variantParams);
    };

    EditionTest.prototype.addContributionsVariant = function (variantId, variantParams) {
        variantParams.campaignCode = this.campaignPrefix + variantId;

        return this.addMessageVariant(variantId, {contributions: variantParams});
    };

    var MembershipEngagementBannerDigipackPriceTest = function() {
        this.id = 'MembershipEngagementBannerDigipackPriceTest';
        this.start = '2017-07-03';
        this.expiry = '2017-08-03';
        this.author = 'Jonathan Rankin';
        this.description = 'Send ';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Each variant points to a different price point on the landing page. The success is measured' +
            'by the click rate on th landing page';
        this.audienceCriteria = 'UK';
        this.idealOutcome = 'We are able to establish which price point is better for the digital edition';
        this.canRun = function() {return true;};

        this.variants = [];
    };

    // cta should be a function which returns the call-to-action which is placed after the message text.
    MembershipEngagementBannerDigipackPriceTest.prototype.addVariant = function(variantId, messageText, cta, paypalClass) {

        function createCampaignCode(variantId) {
            // Campaign code follows convention. Talk to Alex for more information.
            return 'BUNDLE_PRICE_TEST_1M_B_UK_' + variantId;
        }

        var engagementBannerParams = {
            campaignCode: createCampaignCode(variantId),
            buttonCaption: 'Support the Guardian',
            linkUrl: 'https://membership.theguardian.com/bundles',
            messageText: 'Unlike many others, we haven\'t put up a paywall. Support us today and help us keep our journalism as open as we can',
            pageviewId: (config.ophan && config.ophan.pageViewId) || 'not_found'
        };

        if (messageText) {

            if (typeof cta === 'function') {
                messageText = messageText + ' ' + cta()
            }

            engagementBannerParams.messageText = messageText;
        }

        if(paypalClass) {
            engagementBannerParams.paypalClass = paypalClass;
        }

        this.variants.push({
            id: variantId,

            // We don't want to run any 'code' in this test, we just want a variant to be selected.
            // All message display is performed in membership-engagement-banner.js,
            // modifying the banner using the data in variantParams.
            test: function () {},

            success: this.completer,

            // This allows a lot of the deriveBannerParams() logic (in membership-engagement-banner.js) to be by-passed.
            // If that function has picked up a variant from the CopyTest test, call this method and be done with it.
            engagementBannerParams : engagementBannerParams

        });

        return this;
    };

    return [
        new MembershipEngagementBannerDigipackPriceTest()
            .addVariant(
                'A'
            )
            .addVariant(
                'B'
            ).addVariant(
            'C'
        )
    ]
});
