define([
    'bean',
    'qwery',
    'lib/config',
    'lib/detect',
    'commercial/modules/user-features'

], function (
    bean,
    qwery,
    config,
    detect,
    userFeatures
) {
    return function () {
        var self = this;

        this.id = 'MembershipA3A4BundlesThrasher';
        this.start = '2017-02-14';
        this.expiry = '2017-03-09'; // Thursday 9th March
        this.author = 'Justin Pinner';
        this.description = 'Test Exclusive Content Supporter Bundle A3 (ad-free, control) against A2 (with-ads, variant)';
        this.showForSensitive = true;
        this.audience = 0.15;  // 7.5% per variant
        this.audienceOffset = 0.30; // use a new audience segment base
        this.successMeasure = '';
        this.audienceCriteria = 'People on UK network front with at least an 1140px wide display.';
        this.dataLinkNames = '';
        this.idealOutcome = 'We understand which of the A bundle variants is most desirable.';
        this.hypothesis = 'An ad-free offering is desired by more readers (unaffected by commenting)';

        this.canRun = function () {
            return document.querySelector('#membership-ab-thrasher') &&
                !userFeatures.isPayingMember() &&
                detect.isBreakpoint({min: 'leftCol'}) &&
                config.page.isFront &&
                config.page.pageId.toLowerCase() === "uk" &&
                config.page.edition.toUpperCase() === 'UK';
        };

        this.thrasherContainer = function() {
            return document.querySelector('#membership-ab-thrasher');
        };

        this.thrasher = function() {
            return document.querySelector('.membership-ab-thrasher--wrapper');
        };

        this.setCopy = function() {
            if (this.thrasher()) {
                var subTitleEl = document.querySelector('.membership-ab-thrasher_header .sub_title');
                if (subTitleEl) {
                    subTitleEl.innerHTML = '<p>We\'re introducing <strong>new ways</strong> to support<br>the Guardian\'s quality journalism and independent voice. Choose from digital,<br>print or a contribution today.</p>';
                }
            }
        };

        this.setLink = function(variant) {
            if (this.thrasher()) {
                var linkEl = document.querySelector('.membership-ab-thrasher--wrapper .link-button');
                if (linkEl && linkEl.getAttribute('href')) {
                    linkEl.setAttribute('href', config.page.membershipUrl + '/bundles?INTCMP=MEMBERSHIP_A_ADX_THRASHER_' + config.page.edition.toUpperCase() + '_' + variant.toUpperCase());
                }
            }
        };

        this.showThrasher = function() {
            var thrasherContainer = this.thrasherContainer();
            if (thrasherContainer) {
                if (!thrasherContainer.classList.contains('visible')) {
                    thrasherContainer.classList.add('visible');
                }
            }
        };

        this.setup = function(variant) {
            this.setCopy();
            this.setLink(variant);
            this.showThrasher();
        };

        this.completeFunc = function(complete) {
            // fire on thrasher's [find out more -->] button click
            bean.on(qwery('.membership-ab-thrasher--wrapper .link-button')[0], 'click', complete);
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    self.setup('control');   // A3 is our control group (for the benefit of abacus)
                },
                success: this.completeFunc
            },
            {
                id: 'variant',
                test: function () {
                    self.setup('variant');  // variant is A4
                },
                success: this.completeFunc
            }
        ];
    };
});
