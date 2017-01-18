define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        var self = this;

        this.id = 'MembershipBundlesThrasher';
        this.start = '2017-01-12';
        this.expiry = '2017-01-21';
        this.author = 'Justin Pinner';
        this.description = 'Test appetite for membership bundles';
        this.showForSensitive = true;
        this.audience = 0.01;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'People on UK network front';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            // call me paranoid but...
            return document.querySelector('#membership-ab-thrasher') &&
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

        this.paras = {
            Header: '<p>Support<br/>the Guardian</p>',
            Header2: '<p>If you read us, if you like us, if you value our perspective – then become a Supporter and help make our future more secure.</p>',
            VariantHeader2: '<p>We\'re introducing <strong>new ways</strong> to support the Guardian\'s quality journalism and independent voice. Choose from digital, print or a one-off contribution today.</p>'
        };

        this.variantCopy = {
            'control': {
                H1: this.paras["Header"],
                H2: this.paras["Header2"]
            },
            'variant': {
                H1: this.paras["Header"],
                H2: this.paras["VariantHeader2"]
            }
        };

        this.setCopy = function(variant) {
            if (this.thrasher()) {
                var copy = variant === 'control' ? this.variantCopy.control : this.variantCopy.variant;
                var copyH1El = document.querySelector('.membership-ab-thrasher_header .main_title');
                if (copyH1El && copy.H1) {
                    copyH1El.innerHTML = copy.H1;
                }
                var copyH2El = document.querySelector('.membership-ab-thrasher_header .sub_title');
                if (copyH2El && copy.H2) {
                    copyH2El.innerHTML = copy.H2;
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
                if (thrasherContainer.classList.contains('hidden')) {
                    thrasherContainer.classList.remove('hidden');
                }
            }
        };

        this.setup = function(variant) {
            this.setCopy(variant);
            this.setLink(variant.toUpperCase());
            this.showThrasher();
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    self.setup('control');
                }
            },
            {
                id: 'A1',
                test: function () {
                    self.setup('A1')
                }
            },
            {
                id: 'B1',
                test: function () {
                    self.setup('B1');
                }
            }
        ];
    };
});
