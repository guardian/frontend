define([
    'bean',
    'qwery',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/user-features',
    'common/utils/mediator'
], function (
    bean,
    qwery,
    config,
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
        this.audience = 1.0;
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

    return [
        new EditionTest('UK', 'MembershipEngagementBannerUkTest13', '2016-12-22', '2017-01-05', 'gdnwb_copts_mem_banner_uk_banner__')
            .addMembershipVariant('control', {})
            .addMembershipVariant('3_rotating', {messageText: [
                'We all want to make the world a fairer place. We believe journalism can help – but producing it is expensive. That’s why we need Supporters.',
                'Become a Supporter and appreciate every article, knowing you’ve helped bring it to the page. Be part of the Guardian.',
                'Not got round to supporting us yet? If everyone chipped in, our future would be more secure.'
            ]})
            .addMembershipVariant('coffee_95p', {messageText: 'For less than the price of a coffee a week, you could help secure the Guardian\'s future. Support our journalism for 95p a week.'}),
        new EditionTest('AU', 'AuMembEngagementMsgCopyTest8', '2016-11-24', '2017-01-05', 'gdnwb_copts_mem_banner_aubanner__')
            .addMembershipVariant('control', {})
            .addMembershipVariant('fearless_10', {messageText: 'We need you to help support our fearless independent journalism. Become a Guardian Australia member for just $10 a month'})
            .addMembershipVariant('stories_that_matter', {messageText: 'We need your help to tell the stories that matter. Support Guardian Australia now'})
            .addMembershipVariant('power_to_account', {messageText: 'We need your help to hold power to account. Become a Guardian Australia supporter'})
            .addMembershipVariant('independent_journalism', {messageText: 'Support quality, independent journalism in Australia by becoming a supporter'})
        ,new EditionTest('INT', 'MembershipEngagementInternationalExperimentTest12', '2016-12-13', '2017-01-06', 'gdnwb_copts_mem_banner_int_banner__')
            .addMembershipVariant('control', {})
            .addMembershipVariant('1st_article', {minArticles: 1})
            .addMembershipVariant('3rd_article', {minArticles: 3})
            .addMembershipVariant('5th_article', {minArticles: 5})
            .addMembershipVariant('7th_article', {minArticles: 7})
    ];
});
