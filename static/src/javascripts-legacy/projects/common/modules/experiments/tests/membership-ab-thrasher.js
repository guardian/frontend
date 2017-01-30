define([
    'common/utils/config',
    'common/utils/detect',
    'common/modules/commercial/user-features'

], function (
    config,
    detect,
    userFeatures
) {
    return function () {
        var self = this;

        this.id = 'MembershipBundlesThrasher';
        this.start = '2017-01-23';
        this.expiry = '2017-03-02'; // Thursday 2nd March
        this.author = 'Justin Pinner';
        this.description = 'Test appetite for membership bundles';
        this.showForSensitive = true;
        this.audience = 0.05;  // 5% ~ 7,000 unique browser thrasher views per variant per day
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'People on UK network front with at least an 1140px wide display.';
        this.dataLinkNames = '';
        this.idealOutcome = 'One landing page will accrue a higher number of intention interactions than the other';

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
                    linkEl.setAttribute('href', config.page.membershipUrl + '/bundles?INTCMP=MEMBERSHIP_AB_THRASHER_' + config.page.edition + '_' + variant.toUpperCase());
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

        this.variants = [
            {
                id: 'B1',
                test: function () {
                    self.setup('B1');
                }
            },
            {
                id: 'B2',
                test: function () {
                    self.setup('B2');
                }
            }
        ];
    };
});
