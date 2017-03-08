define([
    'bean',
    'qwery',
    'lib/config',
    'lib/geolocation',
    'lib/storage',
    'lib/template',
    'commercial/modules/commercial-features',
    'commercial/modules/user-features',
    'lib/mediator'
], function (
    bean,
    qwery,
    config,
    geolocation,
    storage,
    template,
    commercialFeatures,
    userFeatures,
    mediator
) {
    var EditionTest = function (edition, id, start, expiry, campaignPrefix) {

        this.edition = edition;
        this.campaignPrefix = campaignPrefix;
        this.id = id;
        this.start = start;
        this.expiry = expiry;
        this.author = 'Roberto Tyley';
        this.description = 'Show contributions/membership messages for the ' + edition + ' edition.';
        this.showForSensitive = false;
        this.audience = 0.5;
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
            params: variantParams,
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

        return this.addMessageVariant(variantId, {membership: variantParams});
    };

    EditionTest.prototype.addContributionsVariant = function (variantId, variantParams) {
        variantParams.campaignCode = this.campaignPrefix + variantId;

        return this.addMessageVariant(variantId, {contributions: variantParams});
    };
    // Below are the 6 messages that are being tested, modulo the currency/amount which is dependent on the user's geolocation.
    // The reader's geolocation is also used on the membership website to determine the currency/amount,
    // therefore, the pricing should remain consistent between the engagement banner and the membership website.
    //
    // CONTROL
    // For less than the price of a coffee a week, you could help secure the Guardian's future.
    // Support our journalism for £5 a month.
    //
    // WEEKLY PRICE
    // For less than the price of a coffee a week, you could help secure the Guardian's future.
    // Support our journalism from 95p a week.
    //
    // SOCIAL PROOF
    // Join hundreds of thousands of Guardian readers and help secure our future.
    // Support our journalism today for just £5 a month.
    //
    // OPPORTUNITY
    // If you’ve been thinking about supporting us, we’ve never needed you more.
    // Support our journalism today for just £5 a month.
    //
    // SPEED
    // It only takes two minutes to play your part in helping to secure the Guardian’s future.
    // Support our journalism today for just £5 a month.
    //
    // LOW COST / BIG IMPACT
    // From helping us hold power to account, to giving a voice to the voiceless, your money can do a lot of good.
    // Support our journalism for just £5 a month.

    // We don't want to run these tests on the US or Australia audience, as this would delay releasing them by ~ week.
    function isNotInUSOrAU() {
        var countryCode = geolocation.getSync();
        return countryCode !== 'US' && countryCode !== 'AU'
    }

    // Prices taken from https://membership.theguardian.com/<region>/supporter
    var monthlySupporterCost = {
        GB:  '£5',
        US:  'US$6.99',
        AU:  'AU$10',
        CA:  'CA$6.99',
        EU:  '€4.99',
        INT: 'US$6.99'
    };

    // today boolean argument accounts for the fact that some monthly CTA's contain the word 'today', and others don't
    function monthlySupporterCta(today) {
        var prefix;
        if (today) {
            prefix = 'Support our journalism today for just'
        }
        else {
            prefix = 'Support our journalism for just'
        }
        return function() {
            var region = geolocation.getSupporterPaymentRegion();
            var cost = monthlySupporterCost[region];
            return prefix + ' ' + cost + ' a month.'
        }
    }

    var monthlySupporterCtaWithToday = monthlySupporterCta(true);

    var monthlySupporterCtaWithoutToday = monthlySupporterCta(false);

    // Prices based on https://membership.theguardian.com/<region>/supporter
    var weeklySupporterCost = {
        GB:  '95p',
        US:  'US$1.33',
        AU:  'AU$1.92',
        CA:  'CA$1.33',
        EU:  '€0.95',
        INT: 'US$1.33'
    };

    function weeklySupporterCta() {
        var region = geolocation.getSupporterPaymentRegion();
        var cost = weeklySupporterCost[region];
        return 'Support our journalism today from ' + cost + ' a week.'
    }

    function completer(complete) {
        mediator.on('membership-message:display', function () {
            // When the button link is clicked, call the function that indicates the A/B test is 'complete'
            // ...note that for Membership & Contributions this completion is only the start of a longer
            // journey that will hopefully end pages later with the user giving us money.
            bean.on(qwery('#membership__engagement-message-link')[0], 'click', complete);
        });
    }

    var CopyTest = function() {
        this.id = 'MembershipEngagementBannerCopyTest';
        this.start = '2017-02-27';
        this.expiry = '2017-03-13';
        this.author = 'Guy Dawson';
        this.description = 'Test different copy for the engagement banner.';
        this.audience = 0.5;
        this.audienceOffset = 0.5;
        this.successMeasure = 'Supporter click-through rate and/or acquisition rate';
        this.audienceCriteria = 'All readers.';
        this.idealOutcome = 'We are able to establish which copy is best, with statistical significance';

        this.canRun = function() {
            return commercialFeatures.canReasonablyAskForMoney && isNotInUSOrAU();
        };

        this.variants = [];
    };

    // cta should be a function which returns the call-to-action which is placed after the message text.
    CopyTest.prototype.addVariant = function(variantId, messageText, cta) {

        function createCampaignCode(variantId) {
            // Campaign code follows convention. Talk to Alex for more information.
            return 'gdnwb_copts_mem_kr3_learn_banner_copy_' + variantId;
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
            deriveBannerParams: function() {
                return {
                    minArticles: 3,
                    messageText: messageText + ' ' + cta(),
                    colourStrategy: function() {
                        return 'membership-prominent dark-blue'
                    },
                    linkUrl: 'https://membership.theguardian.com/supporter',
                    buttonCaption: 'Become a Supporter',
                    campaignCode: createCampaignCode(variantId)
                }
            }
        });

        return this;
    };

    return [
        new EditionTest('UK', 'MembershipEngagementBannerUkRemindMeLater', '2017-02-02', '2017-03-20', 'remind_me_later')
            .addMembershipVariant('control', {})
            .addMembershipVariant('remind_me', {showRemindMe : true}),

        // Release the first 3 variants. The remaining 2 will be released when the 'Remind Me Later' test is complete.
        new CopyTest()
            .addVariant(
                'control',
                'For less than the price of a coffee a week, you could help secure the Guardian’s future.',
                monthlySupporterCtaWithoutToday
            )
            .addVariant(
                'weekly_price',
                'For less than the price of a coffee a week, you could help secure the Guardian’s future.',
                weeklySupporterCta
            )
            .addVariant(
                'social_proof',
                'Join hundreds of thousands of Guardian readers and help secure our future.',
                monthlySupporterCtaWithToday
            )
            .addVariant(
                'opportunity',
                'If you’ve been thinking about supporting us, we’ve never needed you more.',
                monthlySupporterCtaWithToday
            )
    ]
});
