define(
    [
        'bean',
        'qwery',
        'lib/config',
        'lib/storage',
        'lodash/utilities/template',
        'commercial/modules/commercial-features',
        'lib/mediator',
    ],
    function(
        bean,
        qwery,
        config,
        storage,
        template,
        commercialFeatures,
        mediator
    ) {
        var EditionTest = function(edition, id, start, expiry, campaignPrefix) {
            this.edition = edition;
            this.campaignPrefix = campaignPrefix;
            this.id = id;
            this.start = start;
            this.expiry = expiry;
            this.author = 'Roberto Tyley';
            this.description =
                'Show contributions/membership messages for the ' +
                edition +
                ' edition.';
            this.showForSensitive = false;
            this.audience = 0;
            this.audienceOffset = 0;
            this.successMeasure = 'Conversion';
            this.audienceCriteria = 'All users in the ' + edition + ' edition.';
            this.dataLinkNames = '';
            this.idealOutcome = '';

            // Required by the A/B testing framework - can not be async, unfortunately
            this.canRun = function() {
                var matchesEdition = config.page.edition == edition;
                return (
                    matchesEdition &&
                    commercialFeatures.commercialFeatures
                        .canReasonablyAskForMoney
                );
            };

            this.completer = function(complete) {
                mediator.on('membership-message:display', function() {
                    /* When the button link is clicked, call the function that indicates the A/B test is 'complete'
                 * ...note that for Membership & Contributions this completion is only the start of a longer
                 * journey that will hopefully end pages later with the user giving us money.
                 */
                    bean.on(
                        qwery('#membership__engagement-message-link')[0],
                        'click',
                        complete
                    );
                });
            };

            this.variants = [];
        };

        EditionTest.prototype.addMessageVariant = function(
            variantId,
            variantParams
        ) {
            this.variants.push({
                id: variantId,
                engagementBannerParams: variantParams,
                /*  We don't want to run any 'code' in this test, we just want a variant to be selected. All message display
             * is performed in membership-engagement-banner.js, modifying the banner using the data in variantParams.
             */
                test: function() {},
                success: this.completer,
            });
            return this;
        };

        EditionTest.prototype.addMembershipVariant = function(
            variantId,
            variantParams
        ) {
            variantParams.campaignCode = this.campaignPrefix + variantId;
            return this.addMessageVariant(variantId, variantParams);
        };

        EditionTest.prototype.addContributionsVariant = function(
            variantId,
            variantParams
        ) {
            variantParams.campaignCode = this.campaignPrefix + variantId;

            return this.addMessageVariant(variantId, {
                contributions: variantParams,
            });
        };

        return [];
    }
);
