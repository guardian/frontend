define([
    'bean',
    'qwery',
    'lib/config',
    'lib/storage',
    'lodash/utilities/template',
    'commercial/modules/commercial-features',
    'commercial/modules/user-features',
    'lib/mediator'
], function (
    bean,
    qwery,
    config,
    storage,
    template,
    commercialFeatures,
    userFeatures,
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
            return matchesEdition && commercialFeatures.canReasonablyAskForMoney;
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

    function completer(complete) {
        mediator.on('membership-message:display', function () {
            // When the button link is clicked, call the function that indicates the A/B test is 'complete'
            // ...note that for Membership & Contributions this completion is only the start of a longer
            // journey that will hopefully end pages later with the user giving us money.
            bean.on(qwery('.js-engagement-message-link')[0], 'click', complete);
        });
    }

    var monthlySupporterCost = {
        UK:  '£5',
        AU:  '$10',
        INT: '$7 / €5'
    };

    function weeklySupporterCta() {
        var edition = config.page.edition;
        if(edition === 'US'){
            return 'Support us with a one-off contribution';
        }
        var cost = monthlySupporterCost[config.page.edition];
        return 'Support us for ' + cost + ' a month.';
    }


    var MembershipEngagementBannerPaywallAndPaypalTestRoundTwo = function() {
        this.id = 'MembershipEngagementBannerPaywallAndPaypalTestRoundTwo';
        this.start = '2017-05-04';
        this.expiry = '2017-05-25';
        this.author = 'Jonathan Rankin';
        this.description = 'Test a combination of the paywall message and paypal for the engagement banner.';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Supporter click-through rate and/or acquisition rate';
        this.audienceCriteria = 'All readers.';
        this.idealOutcome = 'We are able to establish which copy is best, with statistical significance';

        this.canRun = function() {
            return commercialFeatures.canReasonablyAskForMoney ;
        };

        this.variants = [];
    };

    // cta should be a function which returns the call-to-action which is placed after the message text.
    MembershipEngagementBannerPaywallAndPaypalTestRoundTwo.prototype.addVariant = function(variantId, messageText, cta, paypalClass) {

        function createCampaignCode(variantId) {
            // Campaign code follows convention. Talk to Alex for more information.
            return 'gdnwb_copts_memco_paywall_paypal_' + variantId;
        }

        var engagementBannerParams = {
            campaignCode: createCampaignCode(variantId)
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

            success: completer,

            // This allows a lot of the deriveBannerParams() logic (in membership-engagement-banner.js) to be by-passed.
            // If that function has picked up a variant from the CopyTest test, call this method and be done with it.
           engagementBannerParams : engagementBannerParams

        });

        return this;
    };





    return [
        new MembershipEngagementBannerPaywallAndPaypalTestRoundTwo()
            .addVariant(
                'control'
            )
            .addVariant(
                'paypalPaywall',
                'Unlike many others, we haven\'t put up a paywall - we want to keep our journalism as open as we can.',
                weeklySupporterCta,
                'site-message__message--show-paypal'
            )
    ]
});
