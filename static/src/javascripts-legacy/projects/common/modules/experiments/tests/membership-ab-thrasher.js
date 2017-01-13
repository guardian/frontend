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
            H1: 'Support the Guardian',
            H2: 'If you read us, if you like us, if you value our perspective – then become a Supporter and help make our future more secure.',
            HA: 'We\'re introducing new ways to support the Guardian\'s quality journalism and independent voice',
            P1: 'We want to make the world a better, fairer place. Which is why our most important relationship is with our readers.',
            P2: 'If you value our independent journalism, please help to fund it by becoming a Supporter.'
        };

        this.variantCopy = {
            'control': {
                H1: this.paras["H1"],
                H2: this.paras["H2"],
                P1: this.paras["P1"],
                P2: this.paras["P2"]
            },
            'variant': {
                H1: this.paras["H1"],
                H2: this.paras["HA"],
                P1: this.paras["P1"],
                P2: this.paras["P2"]
            }
        };

        this.setCopy = function(variant) {
            if (this.thrasher()) {
                var copy = variant === 'notintest' ? this.variantCopy.control : this.variantCopy.variant;
                var copyH1El = document.querySelector('.membership-ab-thrasher_header h1');
                if (copyH1El) {
                    copyH1El.innerText = copy.H1;
                }
                var copyH2El = document.querySelector('.membership-ab-thrasher_header h2');
                if (copyH2El) {
                    copyH2El.innerText = copy.H2;
                }
                var copyP1El = document.querySelector('.membership-ab-thrasher_header .enticementCopy1');
                if (copyP1El) {
                    copyP1El.innerText = copy.P1;
                }
                var copyP2El = document.querySelector('.membership-ab-thrasher_header .enticementCopy2');
                if (copyP2El) {
                    copyP2El.innerText = copy.P2;
                }
            }
        };

        this.setLink = function(variant) {
            if (this.thrasher()) {
                var linkEl = document.querySelector('.membership-ab-thrasher--wrapper .link-button');
                if (linkEl && linkEl.getAttribute('href')) {
                    linkEl.setAttribute('href', guardian.config.page.membershipUrl + '/bundles?INTCMP=MEMBERSHIP_AB_THRASHER_' + variant.toUpperCase());
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
                id: 'A2',
                test: function () {
                    self.setup('A2');
                }
            },
            {
                id: 'A3',
                test: function () {
                    self.setup('A3');
                }
            },
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
            },
            {
                id: 'B3',
                test: function () {
                    self.setup('B3');
                }
            }
        ];
    };
});
